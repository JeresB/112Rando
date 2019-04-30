$(document).ready(function() {
  // if geolocation enabled
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(showcityname);

    function openweathermapSuccess(data) {
      console.log(JSON.stringify(data));

      $("#cityname").html(data["name"] + " &#40;" + data["sys"]["country"] + "&#41; ");
      $("#description_meteo").html(data["weather"][0]["description"]);
      $("#temperature").html(data["main"]["temp"] + " °C");
    }

    function openweathermapError(e) {
      console.log("Erreur openweathermap : " + JSON.stringify(e));
    }

    function showcityname(position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      var lang = 'fr';

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

      $.ajax({
        url: "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=metric&lang=" + lang + "&appid=b81be0b47a6b3254d91a18fbaeece0c2",
        dataType: 'json',
        success: openweathermapSuccess,
        error: openweathermapError
      })
    }
  }
})
