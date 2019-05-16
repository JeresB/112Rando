function alertDialogReset() {
  var dialog = document.getElementById('alert_dialog_reset')

  if (dialog) {
    dialog.show()
  } else {
    ons.createElement('alert_dialog_reset.html', { append: true })
      .then(function(dialog) {
        dialog.show()
      })
  }
}

// This function allow
function hideAlertDialog() {
  document
    .getElementById('alert_dialog_reset')
    .hide()
}

function resetData() {
  window.localStorage.clear()

  // We open a link to the database
  var randoBDD = window.sqlitePlugin.openDatabase({name: "randoBDD.db", location: 'default'});

  randoBDD.transaction(function(transaction) {
    var executeQuery = "DELETE FROM parcours";
    transaction.executeSql(executeQuery, [],
      // On Success
      function(tx, result) { console.log('Database erase !') },
      // On Error
      function(error) { console.log('reset data from database has failed !') } )
  })

  hideAlertDialog()
  alertDialogResetToast.toggle();
}

function updateUnitTemp(unit) {
  window.localStorage.setItem('temp_unit', unit);

  unitToast.toggle();
}

function updateGPSUnit(unit) {
  window.localStorage.setItem('GPS_unit', unit);

  unitToast.toggle();
}

function onOffNotif(status) {
  window.localStorage.setItem('notif', status);
  console.log("onOffNotif status = " + status)

  if (status == 'off') {
    cordova.plugins.notification.local.cancel(1, function() {
      console.log("[NOTIFICATION CLOSED]");
    });
  } else if (status == 'on') {
    app.checkNotification()
  }

  onOffNotifButtonUpdate()
}

function onOffNotifButtonUpdate() {
  var notif = window.localStorage.getItem('notif')

  if (notif == 'on') {
    $("#buttonOnNotif").attr("disabled", true)
    $("#buttonOffNotif").attr("disabled", false)
    $("#notifStatus").html(' : ON')
  } else if (notif == 'off'){
    $("#buttonOffNotif").attr("disabled", true)
    $("#buttonOnNotif").attr("disabled", false)
    $("#notifStatus").html(' : OFF')
  }
}

$(document).ready(function() {
  onOffNotifButtonUpdate()
})
