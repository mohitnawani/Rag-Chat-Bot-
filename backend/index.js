const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();
const connectDB = require("./src/config/db");
const cors = require("cors");

const cookieParser = require("cookie-parser");
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

const authRoutes = require("./src/routes/authRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);

const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));
app.get("/{*path}", (req, res) => {
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
