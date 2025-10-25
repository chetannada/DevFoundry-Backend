const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/auth");
const getUserRepos = require("../controllers/githubController");

router.get("/repos", authenticateUser, getUserRepos);

module.exports = router;
