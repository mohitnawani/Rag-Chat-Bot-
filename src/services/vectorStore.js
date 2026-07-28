const { PineconeStore } = require("@langchain/pinecone");
const { Pinecone } = require("@pinecone-database/pinecone");
const embeddings = require("./embeddings");

let vectorStore = null;

async function getVectorStore() {
  if (vectorStore) return vectorStore;

  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const pineconeIndex = pc.index(process.env.PINECONE_INDEX);

  vectorStore = new PineconeStore(embeddings, {
    pineconeIndex,
    namespace: process.env.PINECONE_NAMESPACE || "default",
    textKey: "text",
  });

  return vectorStore;
}

module.exports = { getVectorStore };
