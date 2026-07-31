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
const prompt = `${historyBlock}You are a helpful RAG-based document assistant. Follow these rules when responding:

1. **Greetings/small talk** (e.g. "hi", "hello", "how are you"): Respond warmly and briefly introduce yourself — e.g. "Hello! I'm a RAG chatbot that can answer questions about your uploaded document. What would you like to know?" Do not use the context for this.

2. **General/meta questions about your capabilities** (e.g. "what can you do?", "who are you?"): Explain that you can answer questions based on the provided document/context.

3. **Questions answerable from the context**: Answer accurately and concisely using ONLY the information in the context below. Do not add outside knowledge.

4. **Questions NOT answerable from the context** (including personal, unrelated, or general knowledge questions not covered by the document): Politely say you can't answer that and redirect the user — e.g. "I can only answer questions related to the uploaded document. Could you ask something about it?"

5. Keep responses natural and conversational, not robotic. Avoid repeating "based on the context" in every reply.

Context:
${context}

Question: ${question}

Answer:`;

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

  return {
    answer,
    sources: docs.map((d, i) => ({
      fileId: d.metadata.fileId,
      fileName: d.metadata.fileName,
      url: d.metadata.url,
      chunk: d.metadata.chunk ?? i + 1,
      excerpt: d.pageContent.slice(0, 240).trim(),
    })),
  };
}

module.exports = { query, retrieveDocuments, buildContext, generateAnswer };
