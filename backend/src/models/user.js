const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    files: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }],

    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);


