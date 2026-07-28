const https = require("https");
const http = require("http");
const { PDFParse } = require("pdf-parse");

function downloadFile(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        client.get(response.headers.location, (res2) => {
          if (res2.statusCode !== 200) {
            reject(new Error(`Download failed: ${res2.statusCode}`));
            return;
          }
          const chunks = [];
          res2.on("data", (chunk) => chunks.push(chunk));
          res2.on("end", () => resolve(Buffer.concat(chunks)));
          res2.on("error", reject);
        }).on("error", reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed: ${response.statusCode}`));
        return;
      }
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error("PDF download timed out"));
    });
  });
}

async function extractTextFromPdf(url) {
  const buffer = await downloadFile(url);
  const pdf = new PDFParse({ data: buffer });
  const result = await pdf.getText();
  return result.text;
}

module.exports = { extractTextFromPdf };
