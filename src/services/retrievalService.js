const { getVectorStore } = require("./vectorStore");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");

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

async function generateAnswer(question, context) {
  const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.0-flash",
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Answer the question based only on the following context. If you cannot answer from the context, say so.\n\nContext: {context}"],
    ["human", "{question}"],
  ]);

  const chain = prompt.pipe(llm).pipe(new StringOutputParser());
  return await chain.invoke({ context, question });
}

async function query(question, fileId, k = 5) {
  const docs = await retrieveDocuments(question, fileId, k);

  if (docs.length === 0) {
    return { answer: "No relevant documents found to answer your question.", sources: [] };
  }

  const context = buildContext(docs);
  const answer = await generateAnswer(question, context);

  return { answer, sources: docs.map((d) => d.metadata) };
}

module.exports = { query, retrieveDocuments, buildContext, generateAnswer };
