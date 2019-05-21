// -----------------------------------------------------------------------------
// ----- Initialization Functions ----------------------------------------------
// -----------------------------------------------------------------------------

// This function allow a better display of a digit
function dchiffre(nb) {
  if (nb < 10) { // If the number indicated is less than ten
    nb = "0" + nb // Then add a zero in front before display
  }

  return nb
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

// To add effect when click on action button
$('.action_path').click(function() {
  $('.action_path').removeClass('grayscale-75')
  $(this).addClass('grayscale-75')
})

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

  var timer = 0
  var old_timer = 0

  var time // Will contain the execution of the chrono
  var inactive = true // Will control the chrono execution
  var speeds = [] // Will store every speed so we can calcul a average of it
  var distance = 0 // Will contain the distance made
  var startPos = null // Will contain the start position of the user
  var unit = '' // Will display m for meters or km for kilometers

  // When we start a path
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

      // We start by recovering the user’s starting position
      navigator.geolocation.getCurrentPosition(function(position) {
        startPos = position
      }, function(error) {
        console.log('Error occurred when try to start chrono. Error code: ' + error.code)
      })

      // We start to watch the GPS coordinates with the watchPosition function
      // We store the ID of this watchPosition to be able to stop it later
      window.localStorage.setItem('watchID',
        navigator.geolocation.watchPosition(function(position) {

          // If the user has chosen DD or Google maps has GPS unit
          if (window.localStorage.getItem('GPS_unit') != 'DMS') {
            // We will display the GPS coordinates in DD
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
                    Altitude : ${app.round(position.coords.altitude, 3)}
                  </div>
                </ons-card>
              </ons-row>`
            $('#showGPSData').html(html)
          // If the user has chosen DMS has GPS unit
          } else {
            // We will display the GPS coordinates in DMS

            // We convert the GPS coordinates from DD to DMS
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
                    Altitude : ${app.round(position.coords.altitude, 3)}
                  </div>
                </ons-card>
              </ons-row>`
            $('#showGPSData').html(html)
          }

          // We calcul the distance between the starting position and the new position of the user
          new_distance = calculateDistance(
            startPos.coords.latitude, startPos.coords.longitude,
            position.coords.latitude, position.coords.longitude
          )

          // We calcul the meter that the user has just done
          var meter = app.round(new_distance, 3) * 1000

          // We add the new distance to the old one
          distance += new_distance

          // If the distance hasn't reach 1 km will display the distance in meters
          if (distance > 1) {
            d = app.round(distance, 3)
            unit = ' km'
          } else {
            d = app.round(distance, 3) * 1000
            unit = ' m'
          }

          // We save the distance data in storage
          window.localStorage.setItem('distance', app.round(distance, 3))

          // We calcul the new time and save the old one
          timer = 0
          if (h > 0) {
            timer += h * 3600
          }

          if (m > 0) {
            timer += m * 60
          }

          if (s > 0) {
            timer += s
          }
          console.log("HEURE = " + h + " & MINUTES = " + m + " & SECONDES = " + s);
          console.log("TIMER = " + timer + " & old_timer = " + old_timer);
          var save_time = timer
          timer -= old_timer
          old_timer = save_time

          console.log("Apres calcul => TIMER = " + timer + " & old_timer = " + old_timer);

          // We calcul the speed in km/h
          var speed = (meter/timer) * 3.6

          console.log("METER = " + meter + " & TIMER = " + timer + " & SPEED = " + speed);

          // If the speed isn't null we save it
          if (speed > 0) {
            speeds.push(speed)
          }

          console.log("SPEEDS = " + speeds);
          console.log("AVERAGE = " + app.average(speeds));
          console.log("MAX = " + Math.max(...speeds));

          // We calcul the average and max speed
          var vitesse_moyen = app.average(speeds)
          var vitesse_max = Math.max(...speeds)

          // We display the data
          $('#distance').html(d + unit)
          $('#average_speed').html(app.round(vitesse_moyen, 3) + " km/h")
          $('#max_speed').html(app.round(vitesse_max, 3) + " km/h")

          // The starting position is now the new position
          startPos = position
        })
      )
    }
  });

  // When the user want to pause is path
  $("#pause").click(function() {

    // We stop the interval
    clearInterval(time)

    // Affecter true a inactive pour indiquer qu'il n'y a plus d'Intervalle inactive
    inactive = true

    // We clear the watch position to pause the path has requested
    navigator.geolocation.clearWatch(window.localStorage.getItem('watchID'));
  })

  // If the user want to stop a path
  $("#reset").click(function() {
    // We open a link to the database
    var randoBDD = window.sqlitePlugin.openDatabase({name: "randoBDD.db", location: 'default'});

    // We save the timer
    var save_time = dchiffre(h) + ':' + dchiffre(m) + ':' + dchiffre(s)

    // We calcul the average and max speed
    var vitesse_moyen = app.average(speeds)
    var vitesse_max = Math.max(...speeds)

    // We recover the distance
    var save_distance = window.localStorage.getItem('distance')

    // We save all the path data into the database
    randoBDD.transaction(function(transaction) {
      var executeQuery = "INSERT INTO parcours (distance, temps, vitesse_moyen, vitesse_max) VALUES (?,?,?,?)";
      transaction.executeSql(executeQuery, [
          save_distance,
          save_time,
          vitesse_moyen,
          vitesse_max
        ],
        function(tx, result) {
          // To update the language of the alert below
          var lang = window.localStorage.getItem('langue')
          var alert_database = ressources[lang]['path.alert_database'];

          // We alert the user
          alert(alert_database);
        },
        function(error){
          console.log('[SAVE PATH][ERROR] : ' + error);
        }
      );
    });

    // We reset the timer display
    $("#s").html("00");
    $("#m").html("00");
    $("#h").html("00");

    // We reset the data display
    $('#distance').html('0 m')
    $('#average_speed').html('0 km/h')
    $('#max_speed').html('0 km/h')

    // We clear the interval timer
    if (inactive == false) {
      clearInterval(time);
    }

    // We reset the variables that need to be
    s = 0;
    m = 0;
    h = 0;
    inactive = true;
    speeds = []
    distance = 0

    // We reset the distance in storage
    window.localStorage.setItem('distance', 0)

    // We clear the watch position
    navigator.geolocation.clearWatch(window.localStorage.getItem('watchID'));
  });
})
