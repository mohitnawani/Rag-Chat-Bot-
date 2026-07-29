const { query } = require("../services/retrievalService");

const askQuestion = async (req, res) => {
  try {
    const { question, fileId } = req.body;
    if (!question) return res.status(400).json({ message: "Question is required" });

    const result = await query(question, fileId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Query failed", error: error.message });
  }
};

module.exports = { askQuestion };
