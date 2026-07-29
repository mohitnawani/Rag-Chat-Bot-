const { PineconeStore } = require("@langchain/pinecone");
const { Pinecone } = require("@pinecone-database/pinecone");
const embeddings = require("./embeddings");
 
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

 
// Support the existing PINECONE_INDEX setting as well as the more explicit
// PINECONE_INDEX_NAME setting.
const indexName = process.env.PINECONE_INDEX_NAME || process.env.PINECONE_INDEX;

const defaultNamespace = process.env.PINECONE_NAMESPACE || "documents";

function getPineconeIndex() {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is not configured");
  }
  if (!indexName) {
    throw new Error("PINECONE_INDEX or PINECONE_INDEX_NAME is not configured");
  }

  return pinecone.Index(indexName);
}
 
async function storeEmbeddings(documents, namespace = defaultNamespace) {
  const pineconeIndex = getPineconeIndex();
 
  return await PineconeStore.fromDocuments(documents, embeddings, {
    pineconeIndex,
    namespace,
  });
}

async function getVectorStore(namespace = defaultNamespace) {
  const pineconeIndex = getPineconeIndex();
 
  return await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace,
  });
}
 

async function similaritySearch(namespace, query, k = 4) {
  const store = await getVectorStore(namespace);
  return await store.similaritySearch(query, k);
}

async function deleteNamespace(namespace) {
  const pineconeIndex = getPineconeIndex();
  return await pineconeIndex.namespace(namespace).deleteAll();
}

async function deleteFileEmbeddings(fileId, namespace = defaultNamespace) {
  const store = await getVectorStore(namespace);
  return await store.delete({ filter: { fileId: { $eq: fileId } } });
}
 
module.exports = {
  storeEmbeddings,
  getVectorStore,
  similaritySearch,
  deleteNamespace,
  deleteFileEmbeddings,
};
