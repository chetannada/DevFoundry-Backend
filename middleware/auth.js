const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/error");
const UserModel = require("../database/models/userModel");

const authenticateUser = async (req, res, next) => {
  const token = req.cookies.auth_token;
  const refreshToken = req.cookies.refresh_token;

  try {
    // Try verifying auth_token first
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);

    if (!user) return sendError(res, 401, "Invalid token");

    req.user = user;
    return next();
  } catch (err) {
    // If auth_token fails, try refresh_token
    if (!refreshToken) {
      return sendError(
        res,
        401,
        "Authentication required. Token expired and no refresh token found."
      );
    }

    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await UserModel.findById(decodedRefresh.userId);

      if (!user) return sendError(res, 401, "Invalid refresh token");

      // Issue new auth_token
      const newAuthToken = jwt.sign(
        {
          userId: user._id,
          githubUserId: user.github.id,
          userRole: user.userRole,
          memberSince: user.memberSince,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie("auth_token", newAuthToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        path: "/",
      });

      req.user = user;
      return next();
    } catch (refreshErr) {
      return sendError(res, 403, "Refresh token expired or invalid. Please log in again.");
    }
  }
};

module.exports = authenticateUser;
