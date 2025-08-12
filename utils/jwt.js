const jwt = require("jsonwebtoken");

const createToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

module.exports = { createToken };
