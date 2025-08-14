// a single, reusable function for sending consistent error responses.
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: message,
  });
};

module.exports = { sendError };
