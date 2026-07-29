const express = require("express");
const router = express.Router();
const {
  listChats,
  createChat,
  getChat,
  deleteChat,
  askInChat,
} = require("../controllers/chatController");

router.get("/", listChats);
router.post("/", createChat);
router.get("/:id", getChat);
router.delete("/:id", deleteChat);
router.post("/:id/ask", askInChat);

module.exports = router;
