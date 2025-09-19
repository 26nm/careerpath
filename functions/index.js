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
const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const { Storage } = require("@google-cloud/storage");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");
const os = require("os");
const fs = require("fs");
const ignoreWords = require("./utils/IgnoreWords");

admin.initializeApp();
const gcs = new Storage();

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

    const lowerText = extractedText.toLowerCase();

    const extractKeywordsFromText = (text) => {
      const rawTokens = text.match(/\b[a-zA-Z0-9\.\+\#\-]{2,}\b/g) || [];

      const keywords = rawTokens.filter(
        (word, idx) =>
          !ignoreWords.includes(word) && rawTokens.indexOf(word) === idx
      );

      return keywords;
    };

    const extractedSkills = extractKeywordsFromText(lowerText);

    const userId = filePath.split("/")[1];
    const dbRef = admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("resumes");

    await dbRef.add({
      fileName,
      extractedSkills,
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
