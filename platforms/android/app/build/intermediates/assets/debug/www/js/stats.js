var limit = 10
var offset = 0

// When the page has loaded
// We open a link to the database
// Then we request a list of every paths
$( document ).ready(function() {
  loadData()
});

function loadData() {
  console.log("Starting loadData");
  // We open a link to the database
  var randoBDD = window.sqlitePlugin.openDatabase({name: "randoBDD.db", location: 'default'});

  // With this transaction we request the data in parcours table
  randoBDD.transaction(function(transaction) {
    transaction.executeSql('SELECT * FROM parcours ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset], function (tx, results) {
      // We gather the length of the data we collected
      var len = results.rows.length, i;

      console.log(results.rows);

      // Finaly for every paths we add one item list to display the data of the path
      for (i = 0; i < len; i++) {
        $("#liste_data_parcours").append("<ons-list-item>N° " + results.rows.item(i).id + " / " + round(results.rows.item(i).distance, 3) + " km / " + results.rows.item(i).temps + "</ons-list-item>");
      }
    }, null);
  });

  randoBDD.transaction(function(transaction) {
    transaction.executeSql('SELECT * FROM parcours', [], function (tx, results) {
      // We gather the length of the data we collected
      var len = results.rows.length, i;

      var nb_km = 0
      var total_time = 0

      // Then we display this number for the user
      $("#nb_parcours").html(len);

      var nb_restant = (len - limit - offset);

      console.log("NB RESTANT" + nb_restant);

      for (i = 0; i < len; i++) {
        nb_km += results.rows.item(i).distance
        total_time = addTimes(total_time, results.rows.item(i).temps)

        $("#nb_km").html(nb_km)
        $("#total_time").html(total_time)

      }

      if (nb_restant > 0) {
        $("#buttonMoreData").html('<ons-button id="loadMoreData" modifier="large material" class="btn-large" onclick="loadData()">More Data</ons-button>')
        offset += 10
      } else {
        $("#buttonMoreData").html('')
      }

    }, null);
  });
}

// This function allows to choose the number of decimals after the comma
function round(value, decimals) {
  return Number(Math.round( value + 'e' + decimals ) + 'e-' + decimals)
}

/**
 * Add two string time values (HH:mm:ss) with javascript
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
