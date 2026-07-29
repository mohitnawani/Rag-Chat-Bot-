const Chat = require("../models/Chat");
const { query } = require("../services/retrievalService");

const listChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .select("title createdAt updatedAt")
      .sort({ updatedAt: -1 });
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chats", error: error.message });
  }
};

const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({});
    res.status(201).json({ chat });
  } catch (error) {
    res.status(500).json({ message: "Failed to create chat", error: error.message });
  }
};

const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: "Failed to get chat", error: error.message });
  }
};

const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
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

    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.messages.push({ role: "user", text: question });

    if (chat.title === "New Chat") {
      chat.title = question.length > 50 ? question.slice(0, 50) + "..." : question;
    }

    const chatHistory = chat.messages.slice(0, -1);
    const result = await query(question, fileId, chatHistory);
    const answer = result.answer || "No response generated.";

    chat.messages.push({ role: "assistant", text: answer });
    await chat.save();

    res.json({ answer, sources: result.sources || [], chat });
  } catch (error) {
    res.status(500).json({ message: "Query failed", error: error.message });
  }
};

module.exports = { listChats, createChat, getChat, deleteChat, askInChat };
