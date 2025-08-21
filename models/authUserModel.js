const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  githubUserName: { type: String, required: true },
  userName: { type: String, required: true },
  userAvatarUrl: { type: String, required: true },
  userGithubUrl: { type: String, required: true },
  userRole: {
    type: String,
    enum: ["admin", "contributor"],
    default: "contributor",
  },
  memberSince: {
    type: String,
    default: () => {
      const now = new Date();
      return now.toLocaleString("en-US", { month: "long", year: "numeric" });
    },
  },
});

const AuthUser = mongoose.model("GithubAuthUser", userSchema);

module.exports = AuthUser;
