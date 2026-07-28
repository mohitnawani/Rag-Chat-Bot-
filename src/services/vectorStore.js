const { VectorStore } = require("@langchain/core/vectorstores");
const { Document } = require("@langchain/core/documents");
const { Pinecone } = require("@pinecone-database/pinecone");
const { v4 } = require("@langchain/core/utils/uuid");
const embeddings = require("./embeddings");

let vectorStore = null;

class PineconeVectorStore extends VectorStore {
  _vectorstoreType() {
    return "pinecone";
  }

  constructor(embeddings, { pineconeIndex, namespace }) {
    super(embeddings);
    this.pineconeIndex = pineconeIndex;
    this.namespace = namespace || "";
  }

  async addDocuments(documents) {
    const texts = documents.map((d) => d.pageContent);
    const vectors = await this.embeddings.embedDocuments(texts);
    const records = documents.map((doc, i) => ({
      id: v4(),
      values: vectors[i],
      metadata: {
        pageContent: doc.pageContent,
        ...doc.metadata,
      },
    }));
    const ns = this.pineconeIndex.namespace(this.namespace);
    await ns.upsert({ records });
  }

  async similaritySearchVectorWithScore(query, k, filter) {
    const ns = this.pineconeIndex.namespace(this.namespace);
    const result = await ns.query({
      vector: query,
      topK: k,
      filter,
      includeMetadata: true,
    });
    return (result.matches || []).map((match) => [
      new Document({
        id: match.id,
        pageContent: match.metadata?.pageContent || "",
        metadata: match.metadata || {},
      }),
      match.score || 0,
    ]);
  }
}

async function getVectorStore() {
  if (vectorStore) return vectorStore;

  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const indexDesc = await pc.describeIndex(process.env.PINECONE_INDEX);
  const pineconeIndex = pc.index({ host: indexDesc.host });

  vectorStore = new PineconeVectorStore(embeddings, {
    pineconeIndex,
    namespace: process.env.PINECONE_NAMESPACE || "default",
  });

  return vectorStore;
}

module.exports = { getVectorStore };
