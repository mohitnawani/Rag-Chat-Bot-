const File = require("../models/File");
const cloudinary = require("../config/cloudinary");
const { processFile } = require("../services/embeddingPipeline");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = await File.create({
      originalName: req.file.originalname,
      url: req.file.path,
      public_id: req.file.filename,
      format: req.file.mimetype,
      resourceType: req.file.resource_type,
      size: req.file.size,
    });

    if (file.format === "application/pdf") {
      processFile(file._id).catch((err) =>
        console.error("Embedding pipeline error:", err)
      );
    }

    res.status(200).json({
      message: "File uploaded successfully",
      file,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "File upload failed", error: error.message });
  }
};

const listFiles = async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    res.status(200).json({ files });
  } catch (error) {
    console.error("List error:", error);
    res.status(500).json({ message: "Failed to fetch files", error: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    await cloudinary.uploader.destroy(file.public_id, { resource_type: file.resourceType || "image" });
    await File.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete file", error: error.message });
  }
};

module.exports = { uploadFile, listFiles, deleteFile };