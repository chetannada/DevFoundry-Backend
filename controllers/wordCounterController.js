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
    console.error("Error fetching draft:", error);
    return sendError(res, 500, "Failed to fetch word counter draft");
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
      }
    );

    return res.status(200).json({
      displayMessage: "Draft updated successfully",
      draftAfterUpdate: draft,
    });
  } catch (error) {
    console.error("Error updating draft:", error);
    return sendError(res, 500, "Failed to update draft");
  }
};

exports.deleteWordCounterDraft = async (req, res) => {
  try {
    await WordCounterModel.deleteOne({});

    return res.status(200).json({
      displayMessage: "Draft deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return sendError(res, 500, "Failed to delete draft");
  }
};
