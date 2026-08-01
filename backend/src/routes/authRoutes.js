const express = require("express");
const router = express.Router();
const { signup, login, logout, getMe, googleVerify , resetpassword, forgotPassword} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/google/verify", googleVerify);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/password-reset", resetpassword);

module.exports = router;
