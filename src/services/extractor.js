const https = require("https");
const http = require("http");
const { PDFParse } = require("pdf-parse");

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed: ${response.statusCode}`));
        return;
      }
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    }).on("error", reject);
  });
}

async function extractTextFromPdf(url) {
  const buffer = await downloadFile(url);
  const pdf = new PDFParse({ data: buffer });
  await pdf.load();
  const result = await pdf.getText();
  return result.text;
}

module.exports = { extractTextFromPdf };
