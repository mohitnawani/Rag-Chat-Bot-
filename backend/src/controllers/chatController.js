const Chat = require("../models/Chat");
const { query } = require("../services/retrievalService");

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

module.exports = { listChats, createChat, getChat, deleteChat, askInChat };
