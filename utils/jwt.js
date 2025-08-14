const jwt = require("jsonwebtoken");

const generateToken = (user) => {
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

module.exports = { generateToken };
