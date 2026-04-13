/* eslint-disable no-useless-escape */
/**
 * Firebase Cloud Function: parseResumeText
 *
 * Triggered automatically when a resume file is uploaded to Firebase Storage
 * under the "resumes/" folder. It supports PDF and DOCX formats.
 *
 * Workflow:
 * 1. Detects file uploads to the "resumes/" path in Cloud Storage.
 * 2. Downloads the file to a temporary local path.
 * 3. Extracts raw text using `pdf-parse` (for PDFs) or `mammoth` (for DOCX).
 * 4. Converts text to lowercase and compares it against a list of
 *    known technical skills.
 * 5. Stores the matched skills, file metadata, and download URL in the user's
 *    Firestore collection under `resumes`.
 *
 * Dependencies:
 * - firebase-functions
 * - firebase-admin
 * - @google-cloud/storage
 * - pdf-parse
 * - mammoth
 *
 * This function helps power automatic resume analysis for CareerPath.
 *
 * Nolan Dela Rosa
 * July 29, 2025
 */
require("dotenv").config();
const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const { Storage } = require("@google-cloud/storage");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { onCall } = require("firebase-functions/v2/https");
// const nlp = require("compromise");
const OpenAI = require("openai");

admin.initializeApp();
const gcs = new Storage();

/* =======================
AI-Powered Resume Parsing
======================== */
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("API KEY EXISTS:", !!process.env.OPENAI_API_KEY);

async function extractSkillsWithAI(text) {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Extract professional skills from the text. Return ONLY a JSON array of skills. NO markdown, backticks, or explanations.",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  const raw = response.choices[0].message.content;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("AI parse failed:", raw);
    return [];
  }
}

/* =======================
  Storage Trigger
======================== */
exports.parseResumeText = onObjectFinalized(async (event) => {
  const object = event.data;
  const filePath = object.name;
  const contentType = object.contentType;

  if (!filePath.startsWith("resumes/")) {
    logger.log("Not a resume upload. Skipping...");
    return null;
  }

  const fileName = path.basename(filePath);
  const bucket = gcs.bucket(object.bucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);

  await bucket.file(filePath).download({ destination: tempFilePath });

  let extractedText = "";

  try {
    if (contentType === "application/pdf") {
      const dataBuffer = fs.readFileSync(tempFilePath);
      const pdfData = await pdf(dataBuffer);
      extractedText = pdfData.text;
    } else if (
      contentType ===
      "application/vnd.openxmlformats-officedocument." +
        "wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: tempFilePath });
      extractedText = result.value;
    } else {
      console.log(`Unsupported file type: ${contentType}`);
      return;
    }

    // improved extraction
    //const rawTerms = extractMeaningfulTerms(extractedText);
    // const rankedTerms = rankTerms(rawTerms).slice(0, 30);

    const userId = filePath.split("/")[1];
    const dbRef = admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("resumes");

    await dbRef.add({
      fileName,
      resumeText: extractedText,
      uploadedAt: new Date().toISOString(),
      url: `https://firebasestorage.googleapis.com/v0/b/${
        object.bucket
      }/o/${encodeURIComponent(filePath)}?alt=media`,
    });

    console.log(`Parsed and saved resume for ${userId}`);
  } catch (error) {
    console.error("Error parsing resume:", error);
  }

  return null;
});

/* =======================
  Callable Analysis
======================== */
exports.analyzeResume = onCall(async (request) => {
  const { resumeText, jobText } = request.data;

  if (!resumeText && !jobText) {
    throw new Error("Missing resumeText or jobText");
  }

  const resumeSkills = await extractSkillsWithAI(resumeText);
  const jobSkills = await extractSkillsWithAI(jobText);

  console.log("Resume Skills:", resumeSkills);
  console.log("Job Skills:", jobSkills);

  return { resumeSkills, jobSkills };
});
