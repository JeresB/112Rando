var h = 0; // Heure
var m = 0; // Minute
var s = 0; // Seconde

var temps; // Contiendra l'exécution de notre code
var bo = true; // Permettra de contrôler l'exécution du code

function dchiffre(nb) {
  if (nb < 10) { // si le chiffre indiqué est inférieurs à dix ...
    nb = "0" + nb; // .. on ajoute un zéro devant avant affichage
  }

  return nb;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = (lat2 - lat1).toRad();
  var dLon = (lon2 - lon1).toRad();
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}
Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}

$("#start").click(function() {
  if (bo) { // On controle bo pour savoir si un autre Intervalle est lancé
    temps = setInterval(function() {
      s++;

      if (s > 59) {
        m++;
        s = 0;
      }

      if (m > 59) {
        h++;
        m = 0;
      }

      $("#s").html(dchiffre(s));
      $("#m").html(dchiffre(m));
      $("#h").html(dchiffre(h));

    }, 1000);

    // On affecte false à bo pour empécher un second Intervalle de se lancer
    bo = false;

    var startPos = null;
    var distance = 0;

    navigator.geolocation.getCurrentPosition(function(position) {
      startPos = position;
      window.localStorage.setItem('start_latitude', startPos.coords.latitude);
      window.localStorage.setItem('start_longitude', startPos.coords.longitude);
    }, function(error) {
      alert('Error occurred when try to start chrono. Error code: ' + error.code);
    });

    window.localStorage.setItem('watchID',
    navigator.geolocation.watchPosition(function(position) {
      window.localStorage.setItem('current_latitude', position.coords.latitude);
      window.localStorage.setItem('current_longitude', position.coords.latitude);

      distance +=
        calculateDistance(startPos.coords.latitude, startPos.coords.longitude,
          position.coords.latitude, position.coords.longitude);

      document.getElementById('distance').innerHTML = distance;

      startPos = position;
    }));
  }
});

$("#pause").click(function() {

  clearInterval(temps); // On stop l'intervalle lancer

  // On affiche les variable dans les conteneur dédié
  $("#s").html(dchiffre(s));
  $("#m").html(dchiffre(m));
  $("#h").html(dchiffre(h));

  // Affecter true a bo pour indiquer qu'il n'y a plus d'Intervalle actif
  bo = true
});

$("#reset").click(function() {

  s = 0;
  m = 0;
  h = 0;

  $("#s").html("00");
  $("#m").html("00");
  $("#h").html("00");

  if (bo == false) {
    clearInterval(temps);
  }

  bo = true;

  navigator.geolocation.clearWatch(window.localStorage.getItem('watchID'));

});
