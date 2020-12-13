let weatherDisplay = {
  tempTodayEl: document.querySelector("#temp-today span"),
  humidityTodayEl: document.querySelector("#humidity-today span"),
  windTodayEl: document.querySelector("#wind-today span"),
  uvTodayEl: document.querySelector("#uv-today span"),
};

function getTodayWeather() {
  let apiUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=Provo&units=imperial&appid=db286021ea7c4b451e838035ab9b35d0";

  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        let weatherToday = {
          temp: data.main.temp,
          humidity: data.main.humidity,
          wind: data.wind.speed,
        };

        weatherDisplay.tempTodayEl.textContent = weatherToday.temp;
        weatherDisplay.humidityTodayEl.textContent = weatherToday.humidity;
        weatherDisplay.windTodayEl.textContent = weatherToday.wind;
      });
    } else {
      console.log(response.statusText);
    }
  });
}

getTodayWeather();
