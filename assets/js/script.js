const weatherDisplay = {
  todayDateEl: document.querySelector("#today-date"),
  cityNameEl: document.querySelector("#city-name"),
  tempTodayEl: document.querySelector("#temp-today span"),
  humidityTodayEl: document.querySelector("#humidity-today span"),
  windTodayEl: document.querySelector("#wind-today span"),
  uvTodayEl: document.querySelector("#uv-today span"),
};

let searchBarEl = document.querySelector("#search");
let searchTerm = "";
let previousSearches = [];
let previousContainerEl = document.querySelector("#previous-searches");

let locate = {};

weatherDisplay.todayDateEl.textContent = dayjs().format("dddd, MMMM DD, YYYY");

function getTodayWeather() {
  let apiUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    searchTerm +
    "&units=imperial&appid=db286021ea7c4b451e838035ab9b35d0";

  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      response
        .json()
        .then(function (data) {
          let weatherToday = {
            city: data.name,
            temp: data.main.temp,
            humidity: data.main.humidity,
            wind: data.wind.speed,
            icon: data.weather[0].icon,
            desc: data.weather[0].description,
          };

          locate.lon = data.coord.lon;
          locate.lat = data.coord.lat;

          weatherDisplay.cityNameEl.innerHTML =
            weatherToday.city +
            "<img src='https://openweathermap.org/img/wn/" +
            weatherToday.icon +
            "@2x.png' alt='' />" +
            weatherToday.desc;
          weatherDisplay.tempTodayEl.textContent = weatherToday.temp;
          weatherDisplay.humidityTodayEl.textContent = weatherToday.humidity;
          weatherDisplay.windTodayEl.textContent = weatherToday.wind;

          let apiUv =
            "http://api.openweathermap.org/data/2.5/uvi?lat=" +
            locate.lat +
            "&lon=" +
            locate.lon +
            "&appid=db286021ea7c4b451e838035ab9b35d0";

          return fetch(apiUv);
        })
        .then(function (response) {
          response.json().then(function (data) {
            weatherDisplay.uvTodayEl.textContent = data.value;

            switch (true) {
              case data.value <= 2:
                weatherDisplay.uvTodayEl.classList = "uv-low";
                break;
              case data.value <= 5:
                weatherDisplay.uvTodayEl.classList = "uv-moderate";
                break;
              case data.value <= 7:
                weatherDisplay.uvTodayEl.classList = "uv-high";
                break;
              case data.value < 11:
                weatherDisplay.uvTodayEl.classList = "uv-veryhigh";
                break;
              case data.value >= 11:
                weatherDisplay.uvTodayEl.classList = "uv-extreme";
                break;
            }
          });
          console.log(locate.lat, locate.lon);
          let forecastUrl =
            "https://api.openweathermap.org/data/2.5/onecall?lat=" +
            locate.lat +
            "&lon=" +
            locate.lon +
            "&exclude=current,minutely,hourly,alerts&units=imperial&appid=db286021ea7c4b451e838035ab9b35d0";

          return fetch(forecastUrl);
        })
        .then(getForecast);
    } else if (response.statusText === "Not Found") {
      weatherDisplay.cityNameEl.textContent =
        "City name not found. Please try again.";
      weatherDisplay.tempTodayEl.textContent = "";
      weatherDisplay.humidityTodayEl.textContent = "";
      weatherDisplay.windTodayEl.textContent = "";
    } else {
      console.log(response.statusText);
    }
  });
}

function getForecast(response) {
  if (response.ok) {
    response.json().then(function (data) {
      for (let i = 1; i < 6; i++) {
        document.querySelector("#date-" + i).innerHTML =
          dayjs.unix(data.daily[i].dt).format("dd, MMM DD") +
          "<img src='https://openweathermap.org/img/wn/" +
          data.daily[i].weather[0].icon +
          "@2x.png' alt='' />";

        document.querySelector("#temp-" + i + " span").textContent =
          data.daily[i].temp.day;

        document.querySelector("#humidity-" + i + " span").textContent =
          data.daily[i].humidity;
      }
    });
  }
}

function renderPreviousSearch() {
  previousContainerEl.innerHTML = "";
  previousSearches = JSON.parse(localStorage.getItem("previous"));

  previousSearches.forEach(function (search) {
    let newButton = document.createElement("button");
    newButton.classList = "btn btn-light w-100 p-2";
    newButton.textContent = search;
    previousContainerEl.appendChild(newButton);
  });
}

function setPreviousSearch() {
  previousSearches.unshift(searchTerm);

  while (previousSearches.length > 10) {
    previousSearches.splice(10, 1);
  }

  localStorage.setItem("previous", JSON.stringify(previousSearches));

  renderPreviousSearch();
}

function searchHandler(event) {
  event.preventDefault();
  searchTerm = searchBarEl.value;
  getTodayWeather();
  setPreviousSearch();
}

function previousSearchHandler(event) {
  event.preventDefault();
  searchBarEl.value = event.target.textContent;
  searchTerm = event.target.textContent;
  getTodayWeather();
}

if (JSON.parse(localStorage.getItem("previous"))) {
  renderPreviousSearch();
}
document.querySelector("#find").addEventListener("submit", searchHandler);
previousContainerEl.addEventListener("click", previousSearchHandler);
