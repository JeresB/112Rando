// This function will show an alert dialog
// When the user want to delete all data
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

// This function will hide the alert dialog
function hideAlertDialog() {
  document
    .getElementById('alert_dialog_reset')
    .hide()
}

// This function is call when the user want to delete every data
function resetData() {
  // We clear the internal app storage
  window.localStorage.clear()

  // We open a link to the database
  var randoBDD = window.sqlitePlugin.openDatabase({name: "randoBDD.db", location: 'default'});

  // We make a transaction to delete all paths data
  randoBDD.transaction(function(transaction) {
    var executeQuery = "DELETE FROM parcours";
    transaction.executeSql(executeQuery, [],
      // On Success
      function(tx, result) { console.log('[DATABASE ERASED]') },
      // On Error
      function(error) { console.log('[DATABASE ERASE HAS FAILED]') } )
  })

  // We hide to alert dialog
  hideAlertDialog()

  // We tell the user that is request has been fulfill
  alertDialogResetToast.toggle();
}

// This function update the temperature unit chosen by the user
function updateUnitTemp(unit) {
  // We update the temperature unit in storage
  window.localStorage.setItem('temp_unit', unit);

  // We tell the user that is request has been fulfill
  unitToast.toggle();
}

// This function update the GPS unit chosen by the user
function updateGPSUnit(unit) {
  // We update the GPS unit in storage
  window.localStorage.setItem('GPS_unit', unit);

  // We tell the user that is request has been fulfill
  unitToast.toggle();
}

// This function cancel or activate the notification
// One argument status :
  // 'On' => active the notification
  // 'Off' => cancel the notification
function onOffNotif(status) {
  // We update the notification status in storage
  window.localStorage.setItem('notif', status);

  // If the user want to disable the notification
  if (status == 'off') {
    // We call the notification plugin to cancel this notification
    cordova.plugins.notification.local.cancel(1, function() {
      console.log("[NOTIFICATION CLOSED]");
    });
  // If the user want to activate the notification
  } else if (status == 'on') {
    // We call the app method checkNotification to activate it
    app.checkNotification()
  }

  // Then we update HTML buttons in the setting page
  onOffNotifButtonUpdate()
}

// This function will update the HTML of the notification parameter
function onOffNotifButtonUpdate() {
  // We recover the notification status
  var notif = window.localStorage.getItem('notif')

  // If the status is 'On'
  if (notif == 'on') {
    // We disable the On button
    $("#buttonOnNotif").attr("disabled", true)
    // We activate the Off button
    $("#buttonOffNotif").attr("disabled", false)
    // We display the status
    $("#notifStatus").html(' : ON')
  } else if (notif == 'off'){
    // We disable the Off button
    $("#buttonOffNotif").attr("disabled", true)
    // We activate the On button
    $("#buttonOnNotif").attr("disabled", false)
    // We display the status
    $("#notifStatus").html(' : OFF')
  }
}

// When the page has loaded
$(document).ready(function() {
  // We call the function to update the notification button
  onOffNotifButtonUpdate()
})
