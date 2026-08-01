const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  listChats,
  createChat,
  getChat,
  deleteChat,
  askInChat,
  streamAsk,
} = require("../controllers/chatController");

router.use(authMiddleware);

router.get("/", listChats);
router.post("/", createChat);
router.post("/stream", streamAsk);
router.get("/:id", getChat);
router.delete("/:id", deleteChat);
router.post("/:id/ask", askInChat);

module.exports = router;
