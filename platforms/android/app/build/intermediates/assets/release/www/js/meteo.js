// This function is call when an error as occur during the call to openweathermap
function openweathermapError(e) {
  console.log("[OPENWEATHER API CALL][ERROR] : " + JSON.stringify(e));
}

// This function is call when the call to openweathermap is a success
function openweathermapSuccess(data) {
  // Default unit
  var unit = ' °K'

  // We check if the user has choose a unit
  if (window.localStorage.getItem('temp_unit') != null) {
    switch (window.localStorage.getItem('temp_unit')) {
      case 'Celcius':
        unit = ' °C';
        break;
      case 'Fahrenheit':
        unit = ' °F';
        break;
      default:
        unit = ' °K';
    }
  }

  // We use the data from openweathermap to display
    // The cityname & country initiale
  $("#cityname").html(data["name"] + " &#40;" + data["sys"]["country"] + "&#41; ");
    // The weather description
  $("#description_meteo").html(data["weather"][0]["description"]);
    // The temperature with the right unit
  $("#temperature").html(data["main"]["temp"] + unit);
}

function showcityname(position) {
  // Coordinates
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;

  // Default values
  var lang = 'fr';
  var unit = '';

  // We change the language value to the setup of the user
  if (window.localStorage.getItem('langue') != null) {
    switch (window.localStorage.getItem('langue')) {
      case 'fr-FR':
        lang = 'fr';
        break;
      case 'en-EN':
        lang = 'en';
        break;
      default:
        lang = 'fr';
    }
  }

  // We change the unit value to the setup of the user
  if (window.localStorage.getItem('temp_unit') != null) {
    switch (window.localStorage.getItem('temp_unit')) {
      case 'Celcius':
        unit = '&units=metric'
        break;
      case 'Fahrenheit':
        unit = '&units=imperial'
        break;
      default:
        unit = ''
    }
  }

  // We use ajax to call the openweathermap API with the language and unit chosen by the user
  $.ajax({
    url: "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + unit + "&lang=" + lang + "&appid=b81be0b47a6b3254d91a18fbaeece0c2",
    dataType: 'json',
    success: openweathermapSuccess,
    error: openweathermapError
  })
}

// When the page has loaded we start to execute this code
$( document ).ready(function() {
  // If geolocation enabled
  if ("geolocation" in navigator) {
    // We recover the position and call the function showcityname()
    navigator.geolocation.getCurrentPosition(showcityname);
  }
})
