const apiKey = "f5320e869b0152a3552ab0a9ee5a361d";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=";
const airQualityUrl = "https://api.openweathermap.org/data/2.5/air_pollution?";

const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");
const weatherDisplay = document.querySelector(".weather-display");
const hourlyContainer = document.querySelector(".hourly-container");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city !== "") {
    fetchWeather(city);
    fetchForecast(city);
  }
});

async function fetchWeather(city) {
  try {
    const response = await fetch(`${apiUrl}${city}&appid=${apiKey}&units=metric`);
    if (!response.ok) throw new Error("City not found!");
    const data = await response.json();
    displayWeather(data);
    fetchAirQuality(data.coord.lat, data.coord.lon);
  } catch (error) {
    alert(error.message);
  }
}

async function fetchAirQuality(lat, lon) {
  try {
    const response = await fetch(`${airQualityUrl}lat=${lat}&lon=${lon}&appid=${apiKey}`);
    if (!response.ok) throw new Error("Air quality data unavailable!");
    const data = await response.json();
    displayAirQuality(data);
  } catch (error) {
    console.error(error.message);
  }
}

function displayWeather(data) {
  const { name, main, weather } = data;
  const temperature = Math.round(main.temp);
  const humidity = main.humidity;
  const condition = weather[0].description;
  let icon = weather[0].icon
    ? `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`
    : './sun.webp';

  weatherDisplay.innerHTML = `
    <h2>${name}</h2>
    <img src="${icon}" class="weather-icon" alt="${condition}">
    <p class="temperature">${temperature}°C</p>
    <p id="weather-condition">${condition}</p>
    <p><strong>Humidity:</strong> ${humidity}%</p>
    <p id="air-quality"></p>
  `;
}

function displayAirQuality(data) {
  const aqi = data.list[0].main.aqi;
  let airQualityText = "";
  switch (aqi) {
    case 1: airQualityText = "Good"; break;
    case 2: airQualityText = "Fair"; break;
    case 3: airQualityText = "Moderate"; break;
    case 4: airQualityText = "Poor"; break;
    case 5: airQualityText = "Very Poor"; break;
    default: airQualityText = "Unknown";
  }

  document.getElementById("air-quality").innerHTML = `<strong>Air Quality:</strong> ${airQualityText}`;
}

async function fetchForecast(city) {
  try {
    const response = await fetch(`${forecastUrl}${city}&appid=${apiKey}&units=metric`);
    if (!response.ok) throw new Error("City not found!");
    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    alert(error.message);
  }
}

function displayForecast(data) {
  hourlyContainer.innerHTML = "<h3>Next Hours</h3><div class='hourly-items'></div>";
  const hourlyItems = document.querySelector(".hourly-items");
  const forecastList = data.list.slice(0, 5);

  forecastList.forEach(forecast => {
    const time = new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const temp = Math.round(forecast.main.temp);
    let icon = forecast.weather[0].icon
      ? `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`
      : './sun.webp';

    hourlyItems.innerHTML += `
      <div class="hourly-item">
        <p>${time}</p>
        <img src="${icon}" alt="Weather icon">
        <p>${temp}°C</p>
      </div>
    `;
  });
}

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// Express Backend
const express = require("express");
const bodyParser = require("body-parser");
const Weather = require("./WeatherModel");
const app = express();

app.use(bodyParser.json());

app.post("/saveWeather", async (req, res) => {
  try {
    const { city, temperature, condition, humidity, windSpeed } = req.body;
    const newWeather = new Weather({ city, temperature, condition, humidity, windSpeed });
    await newWeather.save();
    res.json({ message: "Weather data saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/getWeather", async (req, res) => {
  try {
    const weatherData = await Weather.find();
    res.json(weatherData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
