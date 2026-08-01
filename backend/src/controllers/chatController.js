const Chat = require("../models/Chat");
const { query, retrieveDocuments, buildContext, buildPrompt } = require("../services/retrievalService");
const { GoogleGenAI } = require("@google/genai");

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateChatTitle = async (question) => {
  try {
    const interaction = await client.interactions.create({
      model: "gemini-3.6-flash",
      input: `Generate a short, concise title (maximum 6 words) for a chat conversation that begins with this user question: "${question}". Reply with only the title — no quotes, no punctuation, no explanation.`,
      generation_config: { thinking_level: "low" },
    });
    const title = (interaction.output_text || "").trim().replace(/["'.]/g, "").slice(0, 60);
    return title || null;
  } catch {
    return null;
  }
};

const listChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id })
      .select("title createdAt updatedAt")
      .sort({ updatedAt: -1 });
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chats", error: error.message });
  }
};

const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({ user: req.user.id });
    res.status(201).json({ chat });
  } catch (error) {
    res.status(500).json({ message: "Failed to create chat", error: error.message });
  }
};

const getChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user.id });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: "Failed to get chat", error: error.message });
  }
};

const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json({ message: "Chat deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete chat", error: error.message });
  }
};

const askInChat = async (req, res) => {
  try {
    const { question, fileId } = req.body;
    if (!question) return res.status(400).json({ message: "Question is required" });

    const chat = await Chat.findOne({ _id: req.params.id, user: req.user.id });
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.messages.push({ role: "user", text: question });

    if (chat.title === "New Chat") {
      chat.title = question.length > 50 ? question.slice(0, 50) + "..." : question;
    }

    await chat.save();

    const chatHistory = chat.messages.slice(0, -1);
    const result = await query(question, fileId, chatHistory);
    const answer = result.answer || "No response generated.";

    chat.messages.push({ role: "assistant", text: answer, sources: result.sources || [] });
    await chat.save();

    res.json({ answer, sources: result.sources || [], chat });
  } catch (error) {
    const message = error?.message || "";
    const isQuota = message.includes("quota") || message.includes("429");
    const isRateLimit = message.includes("rate") || message.includes("429 Too Many");
    if (isQuota) {
      return res.status(429).json({ message: "The AI service is out of quota. Try again later." });
    }
    if (isRateLimit) {
      return res.status(429).json({ message: "The AI service is rate-limited. Wait a moment and try again." });
    }
    res.status(500).json({ message: "The answer could not be generated. Try again." });
  }
};

const streamAsk = async (req, res) => {
  const { question, chatId, fileId } = req.body;
  if (!question) return res.status(400).json({ message: "Question is required" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let aborted = false;
  req.on("close", () => {
    aborted = true;
  });

  const writeDelta = (text) => {
    res.write(`event: delta\ndata: ${JSON.stringify({ text })}\n\n`);
  };

  let chat = null;
  let answer = "";
  let sources = [];

  try {
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: req.user.id });
      if (!chat) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: "Chat not found" })}\n\n`);
        return res.end();
      }
    }

    let isNewChat = false;
    if (chat) {
      isNewChat = chat.title === "New Chat";
      chat.messages.push({ role: "user", text: question });
      if (isNewChat) {
        chat.title = question.length > 50 ? question.slice(0, 50) + "..." : question;
      }
      await chat.save();
    }

    let titlePromise = null;
    if (chat && isNewChat) {
      titlePromise = generateChatTitle(question);
    }

    const chatHistory = chat ? chat.messages.slice(0, -1) : [];
    const docs = await retrieveDocuments(question, fileId, 5);
    sources = docs.map((d, i) => ({
      fileId: d.metadata.fileId,
      fileName: d.metadata.fileName,
      url: d.metadata.url,
      chunk: d.metadata.chunk ?? i + 1,
      excerpt: d.pageContent.slice(0, 240).trim(),
    }));

    if (docs.length === 0) {
      answer = "No relevant documents found to answer your question.";
      writeDelta(answer);
    } else {
      const context = buildContext(docs);
      const prompt = buildPrompt(question, context, chatHistory);

      const stream = await client.interactions.create({
        model: "gemini-3.6-flash",
        input: prompt,
        generation_config: { thinking_level: "low" },
        stream: true,
      });

      for await (const event of stream) {
        if (aborted) break;
        if (event.event_type === "step.delta") {
          if (event.delta.type === "text") {
            answer += event.delta.text;
            writeDelta(event.delta.text);
          }
        }
      }
    }

    if (aborted) return res.end();

    if (chat) {
      if (titlePromise) {
        const aiTitle = await titlePromise;
        if (aiTitle) chat.title = aiTitle;
      }
      chat.messages.push({ role: "assistant", text: answer, sources });
      await chat.save();
    }

    res.write(`event: done\ndata: ${JSON.stringify({ chatId: chat ? chat._id : null, answer, sources })}\n\n`);
    res.end();
  } catch (error) {
    if (aborted) return res.end();
    if (!res.headersSent) {
      res.status(500).json({ message: "Stream failed", error: error.message });
    } else {
      res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
      res.end();
    }
  }
};

module.exports = { listChats, createChat, getChat, deleteChat, askInChat, streamAsk };
