const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();
const connectDB = require("./src/config/db");
const cors = require("cors");

app.use(cors());
app.use(express.json());

const uploadRoutes = require("./src/routes/uploadRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);

const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

const InitalizeConnection = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.log(` Server listening at port: ${process.env.PORT}`);
      console.log(` Running at: http://localhost:${process.env.PORT}`);
    });
  } catch (err) {
    console.error(" Initialization Error:", err);
    process.exit(1);
  }
};

InitalizeConnection();
