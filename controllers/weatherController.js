const axios = require("axios");
const { sendError } = require("../utils/error");

const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;

const COUNTRIES_URL = "https://restcountries.com/v3.1/all?fields=name,cca2";

const GEO_NAMES_URL = process.env.GEO_NAMES_URL;
const GEO_NAMES_USERNAME = process.env.GEO_NAMES_USERNAME;

exports.getWeather = async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return sendError(res, 400, "City parameter is required");
  }

  try {
    const response = await axios.get(OPENWEATHER_BASE_URL, {
      params: { q: city, appid: OPENWEATHER_KEY, units: "metric" },
    });
    const weatherData = response.data;

    res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    if (error.response?.status === 404) {
      return sendError(res, 404, "City not found");
    }
    if (error.response?.status === 401) {
      return sendError(res, 401, "Invalid API key");
    }
    sendError(res, 500, "Failed to fetch weather data");
  }
};

exports.getCountries = async (req, res) => {
  try {
    const response = await axios.get(COUNTRIES_URL);

    const countries = response.data;

    res.json(countries);
  } catch (err) {
    console.error("Error fetching countries:", err);
    sendError(res, 500, "Failed to fetch countries");
  }
};

exports.getCities = async (req, res) => {
  const { country } = req.query;
  if (!country) {
    return sendError(res, 400, "Country parameter is required");
  }

  try {
    const response = await axios.get(GEO_NAMES_URL, {
      params: {
        country: country,
        featureClass: "P", // populated places
        maxRows: 1000,
        username: GEO_NAMES_USERNAME,
      },
    });

    const cities = response.data;

    res.json(cities);
  } catch (err) {
    console.error("Error fetching cities:", err);
    sendError(res, 500, "Failed to fetch cities");
  }
};
