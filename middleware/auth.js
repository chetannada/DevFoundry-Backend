const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/error');
const UserModel = require('../database/models/user');

const authenticateUser = async (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    // If no token is found, send a consistent 401 Unauthorized error.
    return sendError(res, 401, 'Authentication required. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return sendError(res, 401, 'Invalid token');
    }

    req.user = user;
    next();
  } catch (err) {
    // If the token is invalid or expired, send a consistent 401 Unauthorized error.
    return sendError(res, 401, 'Invalid or expired token.');
  }
};

module.exports = authenticateUser;
