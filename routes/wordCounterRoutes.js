const express = require("express");
const router = express.Router();

const {
  getWordCounterDraft,
  updateWordCounterDraft,
  deleteWordCounterDraft,
} = require("../controllers/wordCounterController");

router.get("/get-draft", getWordCounterDraft);

router.put("/update-draft", updateWordCounterDraft);

router.delete("/delete-draft", deleteWordCounterDraft);

module.exports = router;
