const express = require("express");
const router = express.Router();

const { getWeather, getCountries, getCities } = require("../controllers/weatherController");

router.get("/", getWeather);
router.get("/countries", getCountries);
router.get("/cities", getCities);

module.exports = router;
