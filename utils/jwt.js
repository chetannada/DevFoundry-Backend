const jwt = require("jsonwebtoken");

const generateToken = user => {
  try {
    return jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
  } catch (err) {
    // Log the error for debugging purposes.
    console.error("Failed to generate token:", err);
    // Throw an error to be handled by the calling function.
    throw new Error("Failed to generate token.");
  }
};

const generateRefreshToken = user => {
  try {
    return jwt.sign(user, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });
  } catch (err) {
    console.error("Failed to generate refresh token:", err);
    throw new Error("Failed to generate refresh token.");
  }
};

module.exports = { generateToken, generateRefreshToken };
