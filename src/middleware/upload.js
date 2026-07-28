const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary-v2");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "rag_chatbot_uploads",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"],
    resource_type: "auto",
  },
});

const upload = multer({ storage });

module.exports = upload;