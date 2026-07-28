const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },

    url: { type: String, required: true },

    public_id: { type: String, required: true },

    format: { type: String },

    resourceType: { type: String },
    
    size: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);