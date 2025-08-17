const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    codeUrl: { type: String, required: true },
    liveUrl: { type: String, required: true },
    contributor: { type: String, required: true },
    contributorAvatar: { type: String, required: true },
    contributorUrl: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "contributor"],
      default: "contributor",
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("CraftedProjects", projectSchema);

module.exports = Project;
