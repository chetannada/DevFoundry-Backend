const { sendError } = require("../utils/error");
const WordCounterModel = require("../database/models/wordCounterModel");

exports.getWordCounterDraft = async (req, res) => {
  try {
    const draft = await WordCounterModel.findOne();

    if (!draft) {
      return res.status(200).json({ content: "" });
    }

    return res.status(200).json(draft);
  } catch (error) {
    console.error("Error fetching content:", error);
    return sendError(res, 500, "Failed to fetch content");
  }
};

exports.updateWordCounterDraft = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return sendError(res, 400, "Content is required");
    }

    const draft = await WordCounterModel.findOneAndUpdate(
      {},
      {
        content,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      displayMessage: "Content updated successfully",
      draftAfterUpdate: draft,
    });
  } catch (error) {
    console.error("Error updating content:", error);
    return sendError(res, 500, "Failed to update content");
  }
};

exports.deleteWordCounterDraft = async (req, res) => {
  try {
    await WordCounterModel.deleteOne({});

    return res.status(200).json({
      displayMessage: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    return sendError(res, 500, "Failed to delete content");
  }
};
