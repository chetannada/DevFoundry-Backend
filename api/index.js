const serverless = require("serverless-http");
const app = require("../index");

module.exports = serverless(app);
