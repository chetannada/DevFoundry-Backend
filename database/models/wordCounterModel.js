const mongoose = require("mongoose");

const wordCounterSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

const WordCounterModel = mongoose.model("WordCounter", wordCounterSchema, "WordCounter");

module.exports = WordCounterModel;
