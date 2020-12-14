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
// day.js for date handling and parsing Unix timestamps from API
weatherDisplay.todayDateEl.textContent = dayjs().format("dddd, MMMM DD, YYYY");

function getTodayWeather() {
  // this API accepts city name queries
  let apiUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    searchTerm +
    "&units=imperial&appid=db286021ea7c4b451e838035ab9b35d0";

  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      console.log(response);
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
          // second and third APIs do not accept city name queries; lat and lon are required, so these are stored here
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
          // note lon and lat values
          let apiUv =
            "https://api.openweathermap.org/data/2.5/uvi?lat=" +
            locate.lat +
            "&lon=" +
            locate.lon +
            "&appid=db286021ea7c4b451e838035ab9b35d0";
          // this second API call is dependent on lon and lat data from first response, hence the chain
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
      // for misspelled, unknown city names, etc.
      weatherDisplay.cityNameEl.textContent =
        "City name not found. Please try again.";
      weatherDisplay.tempTodayEl.textContent = "";
      weatherDisplay.humidityTodayEl.textContent = "";
      weatherDisplay.windTodayEl.textContent = "";
    } else {
      // for all other errors
      weatherDisplay.cityNameEl.textContent =
        "Unable to obtain weather data. (Error code" +
        response.status +
        ", " +
        response.statusText +
        ")";
    }
  });
}

function getForecast(response) {
  if (response.ok) {
    response.json().then(function (data) {
      // i starts at 1 because forecast API returns an array where index 0 is data for current day, while this forecast starts the day after the current day
      // This for-loop performs 15 querySelector operations and 15 textContent reassignments. I could have assigned all 15 elements to an array or object, but that would have given me a lengthy list in the code without much benefit.
      for (let i = 1; i < 6; i++) {
        document.querySelector("#date-" + i).innerHTML =
          dayjs.unix(data.daily[i].dt).format("dd, MMM DD") +
          "<img src='https://openweathermap.org/img/wn/" +
          data.daily[i].weather[0].icon +
          "@2x.png' alt='' />";
        // index in API response array corresponds with its intended element's id
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
  // limits previous search list to 10 items
  while (previousSearches.length > 10) {
    previousSearches.splice(10, 1);
  }

  // thanks https://www.javascripttutorial.net/array/javascript-remove-duplicates-from-array/ for this trick to remove duplicates from array
  let noDupeSearch = [...new Set(previousSearches)];
  localStorage.setItem("previous", JSON.stringify(noDupeSearch));

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
  // searchTerm is passed to API request then the fetch chain is fired
  searchTerm = event.target.textContent;
  getTodayWeather();
  setPreviousSearch();
}
// prevents empty localStorage from causing an error and breaking the page
if (JSON.parse(localStorage.getItem("previous"))) {
  renderPreviousSearch();
}

document.querySelector("#find").addEventListener("submit", searchHandler);
previousContainerEl.addEventListener("click", previousSearchHandler);
