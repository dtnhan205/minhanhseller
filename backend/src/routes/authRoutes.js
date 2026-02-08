const express = require("express");
const { login, register, me } = require("../controllers/authController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Login - không yêu cầu token
router.post("/login", login);

// Register - yêu cầu token với role admin
router.post("/register", requireAuth, requireRole("admin"), register);

// Me - yêu cầu token
router.get("/me", requireAuth, me);

module.exports = { authRouter: router };


