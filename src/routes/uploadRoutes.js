const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadFile, listFiles, deleteFile } = require("../controllers/uploadController");
const { extractTextFromPdf } = require("../services/extractor");
const { getVectorStore } = require("../services/vectorStore");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");

router.get("/getfiles", listFiles);
router.post("/", upload.single("file"), uploadFile);
router.delete("/:id", deleteFile);

router.post("/extract", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "PDF URL is required" });
    const text = await extractTextFromPdf(url);
    res.json({ text, length: text.length });
  } catch (error) {
    res.status(500).json({ message: "Extraction failed", error: error.message });
  }
});

router.post("/query", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: "Question is required" });

    const store = await getVectorStore();
    const retriever = store.asRetriever({ k: 5 });
    const docs = await retriever.invoke(question);

    if (docs.length === 0) {
      return res.json({ answer: "No relevant documents found to answer your question.", sources: [] });
    }

    const context = docs.map((d) => d.pageContent).join("\n\n");

    const llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-2.0-flash",
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "Answer the question based only on the following context. If you cannot answer from the context, say so.\n\nContext: {context}"],
      ["human", "{question}"],
    ]);

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const answer = await chain.invoke({ context, question });

    res.json({ answer, sources: docs.map((d) => d.metadata) });
  } catch (error) {
    res.status(500).json({ message: "Query failed", error: error.message });
  }
});

module.exports = router;