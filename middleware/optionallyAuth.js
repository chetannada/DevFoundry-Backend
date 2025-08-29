const jwt = require("jsonwebtoken");

const optionallyAuthenticateUser = (req, res, next) => {
  const token = req.cookies.auth_token;

  // No token, proceed without user
  if (!token) return next();

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
  } catch (err) {
    console.warn("Invalid token, proceeding as guest");
  }

  next();
};

module.exports = optionallyAuthenticateUser;
