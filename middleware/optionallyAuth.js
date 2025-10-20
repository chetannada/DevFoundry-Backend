const jwt = require("jsonwebtoken");
const UserModel = require("../database/models/userModel");

const optionallyAuthenticateUser = async (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) return next(); // No token, proceed as guest

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);

    if (user) {
      req.user = user;
    } else {
      console.warn("User not found, proceeding as guest");
    }
  } catch (err) {
    console.warn("Invalid token, proceeding as guest");
  }

  next();
};

module.exports = optionallyAuthenticateUser;
