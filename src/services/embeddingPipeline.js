const { extractTextFromPdf } = require("./extractor");
const { chunkText } = require("./chunking");
const { getVectorStore } = require("./vectorStore");
const File = require("../models/File");

async function processFile(fileId) {
  const file = await File.findById(fileId);

  console.log(`Processing file: ${file ? file.originalName : "File not found"}`);

  
  if (!file) throw new Error("File not found");
  if (file.format !== "application/pdf") {
    console.log(`Skipping non-PDF file: ${file.originalName}`);
    return;
  }

  const text = await extractTextFromPdf(file.url);


  const docs = await chunkText(text, file._id.toString(), file.originalName, file.url);

  console.log(`Extracted docs: ${docs.length} chunks for file: ${file.originalName}`);

  const store = await getVectorStore();
  await store.addDocuments(docs);

  file.embedded = true;
  file.extractedTextLength = text.length;
  file.chunkCount = docs.length;
  await file.save();

  console.log(`Embedded ${docs.length} chunks for ${file.originalName}`);
}

module.exports = { processFile };
