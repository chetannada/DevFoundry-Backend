const express = require("express");
const router = express.Router();

const {
  baseRoot,
  githubRedirect,
  githubCallback,
  getMe,
  logout,
} = require("../controllers/authController");

const authenticateUser = require("../middleware/auth");

router.get("/", baseRoot);

router.get("/auth/github", githubRedirect);

router.get("/auth/github/callback", githubCallback);

router.get("/api/me", authenticateUser, getMe);

router.post("/api/logout", logout);

module.exports = router;
