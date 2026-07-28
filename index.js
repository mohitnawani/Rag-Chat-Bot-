const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./src/config/db");
const cors = require("cors");

app.use(cors());
app.use(express.json());

const uploadRoutes = require("./src/routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);

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