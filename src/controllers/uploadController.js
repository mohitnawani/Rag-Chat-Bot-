const File = require("../models/File");


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

    console.log("File uploaded successfully:", file);


    res.status(200).json({
      message: "File uploaded successfully",
      file,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "File upload failed", error: error.message });
  }
};

module.exports = { uploadFile };