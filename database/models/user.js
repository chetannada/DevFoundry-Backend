const mongoose = require('mongoose');
const softDeletePlugin = require('./softDelete.plugin');
const { USER_ROLES, PROVIDER } = require('../../utils/constants');

const githubUserSchema = new mongoose.Schema({
  _id: false,
  id: { type: Number },
  originalName: { type: String },
  remoteName: { type: String },
  avatarUrl: { type: String },
  url: { type: String },
});

const userSchema = new mongoose.Schema(
  {
    userId: { type: Number },
    github: { type: githubUserSchema },
    userName: { type: String },
    provider: { type: String, enum: PROVIDER, default: PROVIDER.GITHUB },
    userRole: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CONTRIBUTOR,
    },
    memberSince: {
      type: String,
      default: () => {
        const now = new Date();
        return now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      },
    },
  },
  { timestamps: true, versionKey: false }
);

userSchema.plugin(softDeletePlugin);

const UserModel = mongoose.model('User', userSchema, 'User');

module.exports = UserModel;
