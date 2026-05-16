const express = require("express");
const router = express.Router();

const { getWeather } = require("../controllers/weatherController");

router.get("/", getWeather);

module.exports = router;
