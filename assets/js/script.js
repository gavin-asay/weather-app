const weatherDisplay = {
  cityNameEl: document.querySelector("#city-name"),
  tempTodayEl: document.querySelector("#temp-today span"),
  humidityTodayEl: document.querySelector("#humidity-today span"),
  windTodayEl: document.querySelector("#wind-today span"),
  uvTodayEl: document.querySelector("#uv-today span"),
};

function getTodayWeather() {
  let apiUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=Escondido&units=imperial&appid=db286021ea7c4b451e838035ab9b35d0";

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

          let location = {
            lon: data.coord.lon,
            lat: data.coord.lat,
          };

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
            location.lat +
            "&lon=" +
            location.lon +
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
                weatherDisplay.uvTodayEl.classList = "uv-high";
                break;
            }
          });
        });
    } else {
      console.log(response.statusText);
    }
  });
}

getTodayWeather();
