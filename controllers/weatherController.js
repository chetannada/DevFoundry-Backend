const axios = require("axios");
const { sendError } = require("../utils/error");

exports.getWeather = async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return sendError(res, 400, "City parameter is required");
  }

  try {
    const API_KEY = process.env.OPENWEATHER_KEY;
    const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

    const response = await axios.get(BASE_URL, {
      params: { q: city, appid: API_KEY, units: "metric" },
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
