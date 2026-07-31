const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { Document } = require("@langchain/core/documents");

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

async function chunkText(text, fileId, fileName, url) {
  const chunks = await splitter.createDocuments([text]);

  return chunks.map(
    (chunk, index) =>
      new Document({
        id: `${fileId}-${index}`,
        pageContent: chunk.pageContent,
        metadata: { fileId, fileName, url, chunk: index + 1 },
      })
  );
}

module.exports = { chunkText };
