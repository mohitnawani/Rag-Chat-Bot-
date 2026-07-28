const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-embedding-2",
});

module.exports = embeddings;
