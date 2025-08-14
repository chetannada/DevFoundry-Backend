const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/error");

const authenticateUser = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    // If no token is found, send a consistent 401 Unauthorized error.
    return sendError(res, 401, "Authentication required. No token provided.");
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    // If the token is invalid or expired, send a consistent 401 Unauthorized error.
    return sendError(res, 401, "Invalid or expired token.");
  }
};

module.exports = authenticateUser;
