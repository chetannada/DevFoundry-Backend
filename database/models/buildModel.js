const mongoose = require("mongoose");

const buildInfoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    repoUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          const isCore = this.ownerDocument().constructor.modelName === "CoreBuilds";
          return isCore ? /^\/[\w\-]+/.test(v) : /^https?:\/\/.+/.test(v);
        },
        message: props => `Invalid repoUrl format for ${props.path}`,
      },
    },
    liveUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          const isCore = this.ownerDocument().constructor.modelName === "CoreBuilds";
          return isCore ? /^\/[\w\-]+/.test(v) : /^https?:\/\/.+/.test(v);
        },
        message: props => `Invalid liveUrl format for ${props.path}`,
      },
    },
    techStack: {
      type: [String],
      set: arr => arr.map(item => item.trim().toLowerCase()),
      validate: {
        validator: function (arr) {
          const unique = new Set(arr);
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
    submittedAt: { type: Date, default: null },
  },
  { _id: false }
);

const contributorSchema = new mongoose.Schema(
  {
    id: { type: Number },
    name: { type: String, required: true },
    avatarUrl: { type: String, required: true },
    profileUrl: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "contributor"],
      default: "contributor",
    },
  },
  { _id: false }
);

const userActionSchema = new mongoose.Schema(
  {
    by: { type: String, default: null },
    byRole: {
      type: String,
      enum: ["admin", "contributor"],
      default: null,
    },
    at: { type: Date, default: null },
  },
  { _id: false }
);

const deletedSchema = new mongoose.Schema(
  Object.assign({}, userActionSchema.obj, {
    isDeleted: { type: Boolean, default: false },
  }),
  { _id: false }
);

const reviewedSchema = new mongoose.Schema(
  Object.assign({}, userActionSchema.obj, {
    rejectionReason: { type: String, default: null },
    suggestion: { type: String, default: null },
  }),
  { _id: false }
);

const restoredSchema = new mongoose.Schema(
  Object.assign({}, userActionSchema.obj, {
    reason: { type: String, default: null },
  }),
  { _id: false }
);

const buildSchema = new mongoose.Schema(
  {
    build: { type: buildInfoSchema, required: true },
    contributor: { type: contributorSchema, required: true },
    updated: { type: userActionSchema, default: null },
    deleted: { type: deletedSchema, default: null },
    reviewed: { type: reviewedSchema, default: null },
    restored: { type: restoredSchema, default: null },
  },
  { timestamps: true, versionKey: false }
);

const CoreBuild = mongoose.model("CoreBuilds", buildSchema);
const CommunityBuild = mongoose.model("CommunityBuilds", buildSchema);

module.exports = { CoreBuild, CommunityBuild };
