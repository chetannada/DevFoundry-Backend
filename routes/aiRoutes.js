const express = require("express");
const { summarizeText } = require("../controllers/aiController");
const router = express.Router();

router.post("/summarize", summarizeText);

module.exports = router;
