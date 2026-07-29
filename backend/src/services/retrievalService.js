const { getVectorStore } = require("./vectorStore");

let genai;
async function getGenAI() {
  if (!genai) {
    const { GoogleGenAI } = await import("@google/genai");
    genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genai;
}

async function retrieveDocuments(question, fileId, k = 5) {
  const store = await getVectorStore();
  const retriever = store.asRetriever({
    k,
    ...(fileId ? { filter: { fileId: { $eq: fileId } } } : {}),
  });
  return await retriever.invoke(question);
}

function buildContext(docs) {
  return docs.map((d) => d.pageContent).join("\n\n");
}

function buildHistoryBlock(history) {
  if (!history || history.length === 0) return "";
  const lines = history.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`);
  return `Previous conversation:\n${lines.join("\n")}\n\n`;
}

async function generateAnswer(question, context, chatHistory) {
  const ai = await getGenAI();
  const historyBlock = buildHistoryBlock(chatHistory);
  const prompt = `${historyBlock}Answer the question based only on the following context. If you cannot answer from the context, say so.\n\nContext:\n${context}\n\nQuestion: ${question}`;

  const interaction = await ai.interactions.create({
    model: "gemini-3.6-flash",
    input: prompt,
    generation_config: { thinking_level: "low" },
  });
  return interaction.output_text;
}

async function query(question, fileId, chatHistory, k = 5) {
  const docs = await retrieveDocuments(question, fileId, k);

  if (docs.length === 0) {
    return { answer: "No relevant documents found to answer your question.", sources: [] };
  }

  const context = buildContext(docs);
  const answer = await generateAnswer(question, context, chatHistory);

  return { answer, sources: docs.map((d) => d.metadata) };
}

module.exports = { query, retrieveDocuments, buildContext, generateAnswer };
