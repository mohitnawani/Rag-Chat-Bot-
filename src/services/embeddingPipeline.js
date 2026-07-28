const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { Document } = require("@langchain/core/documents");
const { extractTextFromPdf } = require("./extractor");
const { getVectorStore } = require("./vectorStore");
const File = require("../models/File");

async function processFile(fileId) {
  const file = await File.findById(fileId);
  if (!file) throw new Error("File not found");
  if (file.format !== "application/pdf") {
    console.log(`Skipping non-PDF file: ${file.originalName}`);
    return;
  }

  const text = await extractTextFromPdf(file.url);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await splitter.createDocuments([text]);

  const docs = chunks.map(
    (chunk) =>
      new Document({
        pageContent: chunk.pageContent,
        metadata: {
          fileId: file._id.toString(),
          fileName: file.originalName,
          url: file.url,
        },
      })
  );

  const store = await getVectorStore();
  await store.addDocuments(docs);

  file.embedded = true;
  file.extractedTextLength = text.length;
  file.chunkCount = docs.length;
  await file.save();

  console.log(`Embedded ${docs.length} chunks for ${file.originalName}`);
}

module.exports = { processFile };
