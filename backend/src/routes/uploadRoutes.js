const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadFile, listFiles, deleteFile } = require("../controllers/uploadController");
const { askQuestion } = require("../controllers/queryController");
const { extractTextFromPdf } = require("../services/extractor");

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

router.post("/query", askQuestion);

module.exports = router;
