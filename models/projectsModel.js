const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectTitle: { type: String, required: true },
    projectDescription: { type: String, required: true },
    githubCodeUrl: { type: String, required: true },
    liveUrl: { type: String, required: true },
    contributorName: { type: String, required: true },
    contributorId: { type: Number, required: true },
    contributorAvatarUrl: { type: String, required: true },
    contributorGithubUrl: { type: String, required: true },
    contributorRole: {
      type: String,
      enum: ["admin", "contributor"],
      default: "contributor",
    },
    techStack: {
      type: [String],
      validate: {
        validator: function (arr) {
          const unique = new Set(arr.map(item => item.trim().toLowerCase()));
          return unique.size === arr.length && arr.length <= 8;
        },
        message: "Tech stack must be unique and not exceed 8 items.",
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    updatedBy: { type: String, default: null },
    updatedByRole: {
      type: String,
      enum: ["admin", "contributor"],
      default: null,
    },
    reviewedBy: { type: String, default: null },
    reviewedByRole: {
      type: String,
      enum: ["admin", "contributor"],
      default: null,
    },
    reviewedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deletedByRole: {
      type: String,
      enum: ["admin", "contributor"],
      default: null,
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const CraftedProject = mongoose.model("CraftedProject", projectSchema);
const CuratedProject = mongoose.model("CuratedProject", projectSchema);

module.exports = { CraftedProject, CuratedProject };
