const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectTitle: { type: String, required: true },
    projectDescription: { type: String, required: true },
    githubCodeUrl: { type: String, required: true },
    liveUrl: { type: String, required: true },
    contributorName: { type: String, required: true },
    contributorAvatarUrl: { type: String, required: true },
    contributorGithubUrl: { type: String, required: true },
    contributorRole: {
      type: String,
      enum: ["admin", "contributor"],
      default: "contributor",
    },
    isApproved: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true }
);

const Project = mongoose.model("CraftedProjects", projectSchema);

module.exports = Project;
