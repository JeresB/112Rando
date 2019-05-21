// In the stats page we display every path made by the user
// But we only want to display those path ten by ten
// So we use two variables limit and offset to control
// the database request better
var limit = 10
var offset = 0

// When the page has loaded
// We open a link to the database
// Then we request a list of ten paths
// We also gather every path to make some data
$( document ).ready(function() {
  loadStatsData()
  loadPathsData()
});

// This function will recover every paths and make some data with them
function loadStatsData() {
  // We open a link to the database
  var randoBDD = window.sqlitePlugin.openDatabase({name: "randoBDD.db", location: 'default'});

  // With this transaction we request every paths in the database
  randoBDD.transaction(function(transaction) {
    transaction.executeSql('SELECT * FROM parcours', [], function (tx, results) {
      // We gather the length of the data we collected
      var len = results.rows.length, i;

      // We create variables for the data we want to display
      var nb_km = 0
      var total_time = 0
      var average_speed = []
      var max_speed = 0

      // We display the number of paths to the user
      $("#nb_parcours").html(len);

      // For every paths
      for (i = 0; i < len; i++) {
        // We increase the distance
        nb_km += results.rows.item(i).distance
        // We increase the total time
        total_time = addTimes(total_time, results.rows.item(i).temps)

        // We add every average speed in an array
        average_speed.push(results.rows.item(i).vitesse_moyen)

        // We calcul the max speed
        if (results.rows.item(i).vitesse_max > max_speed) {
          max_speed = results.rows.item(i).vitesse_max
        }
      }

      // We display in the HTML
        // The total distance
      $("#stats_nb_km").html(nb_km)
        // The total time
      $("#stats_total_time").html(total_time)
        // The max speed
      $("#stats_max_speed").html(max_speed)
        // The overall average speed
      $("#stats_average_speed").html(app.round(app.average(average_speed), 3) + ' km/h')
    }, null);
  });
}

// This function will check if we have more paths data to display for the user
// If we do then we will add a button so the user can see more paths data
function showButtonMoreData() {
  // We open a link to the database
  var randoBDD = window.sqlitePlugin.openDatabase({name: "randoBDD.db", location: 'default'});

  // With this transaction we request every paths in the database
  randoBDD.transaction(function(transaction) {
    transaction.executeSql('SELECT * FROM parcours', [], function (tx, results) {
      // We gather the length of the data we collected
      var len = results.rows.length, i;

      // With the langht, the limit and the offset we calcul the remaining path
      var remaining_path = (len - limit - offset);

      // To update the language of the button
      // We add to do this because this button is made after the DOM is ready
      var lang = window.localStorage.getItem('langue')
      var more_data = ressources[lang]['stats.more_data'];

      // If we have more paths to display we add a button
      // This button will allow the user to display more paths data
      if (remaining_path > 0) {
        $("#buttonMoreData").html(`
          <ons-button
            id="loadMoreData"
            modifier="large material"
            class="btn-large"
            onclick="loadPathsData()">
            ${more_data}
          </ons-button>`)
        // We increase the offset
        offset += 10
      } else {
        // If the user can already see every paths then we remove the button
        $("#buttonMoreData").html('')
      }

    }, null);
  });
}

function loadPathsData() {
  // We open a link to the database
  var randoBDD = window.sqlitePlugin.openDatabase({name: "randoBDD.db", location: 'default'});

  // With this transaction we request the data in parcours table
  randoBDD.transaction(function(transaction) {
    transaction.executeSql('SELECT * FROM parcours ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset], function (tx, results) {
      // We gather the length of the data we collected
      var len = results.rows.length, i;

      // Finaly for every paths we add one item list to display the data of the path
      for (i = 0; i < len; i++) {
        $("#liste_data_parcours").append("<ons-list-item>N° " + results.rows.item(i).id + " / " + app.round(results.rows.item(i).distance, 3) + " km / " + results.rows.item(i).temps + "</ons-list-item>");
      }
    }, null);
  });

  // We call the function to add the button showMoreData if we have more data
  showButtonMoreData()
}

/**
 * Add two string time values (HH:mm:ss) with javascript
 * Find on internet : https://gist.github.com/joseluisq/dc205abcc9733630639eaf43e267d63f
 *
 * Usage:
 *  > addTimes('04:20:10', '21:15:10');
 *  > "25:35:20"
 *  > addTimes('04:35:10', '21:35:10');
 *  > "26:10:20"
 *  > addTimes('30:59', '17:10');
 *  > "48:09:00"
 *  > addTimes('19:30:00', '00:30:00');
 *  > "20:00:00"
 *
 * @param {String} startTime  String time format
 * @param {String} endTime  String time format
 * @returns {String}
 */
function addTimes (startTime, endTime) {
  var times = [ 0, 0, 0 ]
  var max = times.length

  var a = (startTime || '').split(':')
  var b = (endTime || '').split(':')

  // normalize time values
  for (var i = 0; i < max; i++) {
    a[i] = isNaN(parseInt(a[i])) ? 0 : parseInt(a[i])
    b[i] = isNaN(parseInt(b[i])) ? 0 : parseInt(b[i])
  }

  // store time values
  for (var i = 0; i < max; i++) {
    times[i] = a[i] + b[i]
  }

  var hours = times[0]
  var minutes = times[1]
  var seconds = times[2]

  if (seconds >= 60) {
    var m = (seconds / 60) << 0
    minutes += m
    seconds -= 60 * m
  }

  if (minutes >= 60) {
    var h = (minutes / 60) << 0
    hours += h
    minutes -= 60 * h
  }

  return ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2)
}
