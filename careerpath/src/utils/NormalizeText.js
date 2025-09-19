export default function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/node\.?js/g, "nodejs")
    .replace(/react\.?js/g, "react")
    .replace(/vue\.?js/g, "vue")
    .replace(/angular\.?js/g, "angular")
    .replace(/restful api(s)?/g, "restful")
    .replace(/ci\/cd|ci cd|ci-cd/g, "cicd")
    .replace(/google cloud platform/g, "gcp")
    .replace(/amazon web services|aws cloud/g, "aws")
    .replace(/tailwind css/g, "tailwind")
    .replace(/html5/g, "html")
    .replace(/css3/g, "css")
    .replace(/\s+/g, " ")
    .trim();
}
