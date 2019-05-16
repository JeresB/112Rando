// -----------------------------------------------------------------------------
// ----- Initialization Functions ----------------------------------------------
// -----------------------------------------------------------------------------

// This function takes two arguments : latitude & longitude
// And will return the coordinates data in DMS
function convertDDToDMS(lat, lng) {
  var convertLat = Math.abs(lat);
  var LatDeg = Math.floor(convertLat);
  var LatMin = (Math.floor((convertLat - LatDeg) * 60));
  var LatSec = Math.round((convertLat - LatDeg - LatMin / 60) * 3600 * 1000) / 1000;
  var LatCardinal = ((lat > 0) ? "N" : "S");

  var convertLng = Math.abs(lng);
  var LngDeg = Math.floor(convertLng);
  var LngMin = (Math.floor((convertLng - LngDeg) * 60));
  var LngSec = Math.round((convertLng - LngDeg - LngMin / 60) * 3600 * 1000) / 1000;
  var LngCardinal = ((lng > 0) ? "E" : "W");

  var newLat = LatDeg + '° ' + LatMin + "' " + LatSec + '" ' + LatCardinal
  var newLng = LngDeg + '° ' + LngMin + "' " + LngSec + '" ' + LngCardinal

  return [newLat, newLng]
  //return LatDeg + '° ' + LatMin + "' " + LatSec + '" ' + LatCardinal + "<br />" + LngDeg + '° ' + LngMin + "' " + LngSec + '" ' + LngCardinal;
}

// This function allow a better display of a digit
function dchiffre(nb) {
  if (nb < 10) { // If the number indicated is less than ten
    nb = "0" + nb // Then add a zero in front before display
  }

  return nb
}

// This function allows to choose the number of decimals after the comma
function round(value, decimals) {
  return Number(Math.round( value + 'e' + decimals ) + 'e-' + decimals)
}

// This function calculates a distance between 2 GPS coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371 // km

  var dLat = (lat2 - lat1).toRad()
  var dLon = (lon2 - lon1).toRad()

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  var d = R * c

  return d
}

function average(array) {
	var n = array.length;
	var sum = 0;
	for(i = 0; i < n; i++) {
		sum += array[i];
	}
	var result = sum / n;
	return result;
}

// -----------------------------------------------------------------------------
// ----- When the document is ready we start the code execution ----------------
// -----------------------------------------------------------------------------
$( document ).ready(function() {
  // -----------------------------------------------------------------------------
  // ----- Variables Initialization ----------------------------------------------
  // -----------------------------------------------------------------------------
  var h = 0 // Hour
  var m = 0 // Minute
  var s = 0 // Second

  var time // Will contain the execution of the chrono
  var inactive = true // Will control the chrono execution
  var speeds = [] // Will store every speed so we can calcul a average of it

  // We create a prototype function that will
  // allow us to convert any number into radian
  Number.prototype.toRad = function() {
    return this * Math.PI / 180
  }

  $("#start").click(function() {
    // We use the inactive variable to prevent the execution of several chrono
    if (inactive) {
      time = setInterval(function() {
        // We add one second every time this function is called
        s++

        if (s > 59) {
          m++
          s = 0
        }

        if (m > 59) {
          h++
          m = 0
        }

        // After the calculations above, we display the new values
        $("#s").html(dchiffre(s))
        $("#m").html(dchiffre(m))
        $("#h").html(dchiffre(h))

      }, 1000) // We call the function above every second

      // Assign false to inactive to prevent a second interval from starting
      inactive = false

      var startPos = null
      var distance = 0
      var unit = ''

      // We start by recovering the user’s starting position
      navigator.geolocation.getCurrentPosition(function(position) {
        startPos = position

        // We store the position
        window.localStorage.setItem('start_latitude', startPos.coords.latitude)
        window.localStorage.setItem('start_longitude', startPos.coords.longitude)
      }, function(error) {
        console.log('Error occurred when try to start chrono. Error code: ' + error.code)
      })

      // We start to watch the GPS coordinates with the watchPosition function
      // We store the ID of this watchPosition to be able to stop it later
      window.localStorage.setItem('watchID',
        navigator.geolocation.watchPosition(function(position) {

          // We store the position
          window.localStorage.setItem('current_latitude', position.coords.latitude)
          window.localStorage.setItem('current_longitude', position.coords.longitude)

          // console.log(JSON.stringify(position.coords.latitude));
          // console.log("position.coords.speed = " + position.coords.speed)
          // if (position.coords.speed != null) {
          //   alert("SPEED = " + position.coords.speed)
          // }

          speeds.push(position.coords.speed)
          window.localStorage.setItem('speeds', speeds)

          if (window.localStorage.getItem('GPS_unit') != 'DMS') {
            var html = `
              <ons-row>
                <ons-card modifier="material" style="width: 100%; text-align: center;">
                  <div class="content">
                    Latitude : ${position.coords.latitude}
                  </div>
                  <div class="content">
                    Longitude : ${position.coords.longitude}
                  </div>
                  <div class="content">
                    Altitude : ${position.coords.altitude}
                  </div>
                </ons-card>
              </ons-row>`
            $('#showGPSData').html(html)
          } else {
            const result = app.convertDDToDMS(position.coords.latitude, position.coords.longitude)
            const lat = result[0]
            const lng = result[1]

            var html = `
              <ons-row>
                <ons-card modifier="material" style="width: 100%; text-align: center;">
                  <div class="content">
                    Latitude : ${lat}
                  </div>
                  <div class="content">
                    Longitude : ${lng}
                  </div>
                  <div class="content">
                    Altitude : ${position.coords.altitude}
                  </div>
                </ons-card>
              </ons-row>`
            $('#showGPSData').html(html)
          }

          distance += calculateDistance(
            startPos.coords.latitude, startPos.coords.longitude,
            position.coords.latitude, position.coords.longitude
          )

          if (distance > 1) {
            d = round(distance, 3)
            unit = ' km'
          } else {
            d = round(distance, 3) * 1000
            unit = ' m'
          }

          window.localStorage.setItem('distance', round(distance, 3))
          var vitesse_moyen = average(window.localStorage.getItem('speeds'))
          var vitesse_max = Math.max(window.localStorage.getItem('speeds'))

          console.log("Vitesse moyenne : " + vitesse_moyen + " & vitesse max : " + vitesse_max);

          $('#distance').html(d + unit)
          $('#average_speed').html(vitesse_moyen)
          $('#max_speed').html(vitesse_max)

          startPos = position
        })
      )
    }
  });

  $("#pause").click(function() {

    clearInterval(time) // On stop l'intervalle lancer

    // On affiche les variable dans les conteneur dédié
    $("#s").html(dchiffre(s))
    $("#m").html(dchiffre(m))
    $("#h").html(dchiffre(h))

    var vitesse_moyen = average(window.localStorage.getItem('speeds'))
    var vitesse_max = Math.max(window.localStorage.getItem('speeds'))

    $('#average_speed').html(vitesse_moyen)
    $('#max_speed').html(vitesse_max)

    // Affecter true a inactive pour indiquer qu'il n'y a plus d'Intervalle inactive
    inactive = true
  })

$("#reset").click(function() {
  var randoBDD = window.sqlitePlugin.openDatabase({name: "randoBDD.db", location: 'default'});

  var save_time = dchiffre(h) + ':' + dchiffre(m) + ':' + dchiffre(s)
  var vitesse_moyen = average(window.localStorage.getItem('speeds'))
  var vitesse_max = Math.max(window.localStorage.getItem('speeds'))

  randoBDD.transaction(function(transaction) {
    var executeQuery = "INSERT INTO parcours (distance, temps, vitesse_moyen, vitesse_max) VALUES (?,?,?,?)";
    transaction.executeSql(executeQuery, [
        window.localStorage.getItem('distance'),
        save_time,
        vitesse_moyen,
        vitesse_max
      ],
      function(tx, result) {
        alert('Inserted');
      },
      function(error){
        alert('Error occurred');
      }
    );
  });

  s = 0;
  m = 0;
  h = 0;

  $("#s").html("00");
  $("#m").html("00");
  $("#h").html("00");

  if (inactive == false) {
    clearInterval(time);
  }

  inactive = true;
  speeds = []

  $('#distance').html('0 m')
  $('#average_speed').html(vitesse_moyen)
  $('#max_speed').html(vitesse_max)
  navigator.geolocation.clearWatch(window.localStorage.getItem('watchID'));


});

})
