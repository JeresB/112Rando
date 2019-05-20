// We declare an array
// That we will use to store every language of every text for this app
var ressources = new Array();

// We create a prototype function that will
// allow us to convert any number into radian
Number.prototype.toRad = function() {
  return this * Math.PI / 180
}

// We declare to app object
// This object will contains few methods use by this app
var app = {
  // This method will initialize this app
  initialize: function() {
    this.bindEvents();
  },
  // This method will add a event listener 'deviceready'
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  // This method will be call when the device is ready
  onDeviceReady: function() {
    // We receive the event deviceready
    app.receivedEvent('deviceready');

    // Now that the app as loaded we can hide the splashscreen (Its a picture)
    navigator.splashscreen.hide();

    // We check if the user has accepted the permissions we need
    // If not the function will request them
    app.checkPermissions();

    // We load every translation in the ressources array
    app.loadTraduction();

    // We setup the language
    app.setLanguage();

    // We setup the database
    app.setupBDD();

    // We incremente a variable to mesure the number of use of this app
    window.localStorage.setItem('use', window.localStorage.getItem('use') + 1)

    // If the user has use this app at least three time
    // We activate the notification
    // This notification will allow the user
    // to perform some action even with the app close
    // We doesn't activate this option with the first use
    // because it's a bit too much to start
    if (window.localStorage.getItem('use') > 3 || window.localStorage.getItem('notif') == 'on') {
      app.checkNotification()
    }

    // If the user has not provided contact information
    if (window.localStorage.getItem('contact') == null || window.localStorage.getItem('contact') == '') {
      // To update the language of the alert below
      var lang = window.localStorage.getItem('langue')
      var alert_contact_not_provided = ressources[lang]['home.alert_contact_not_provided'];

      // We alert the user before we redirect him to another page
      alert(alert_contact_not_provided)

      // We load the contact page
      app.load('contact.html')
    }
  },
  // Create by phonegap
  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = $(id + ' > .listening');
    var receivedElement = $(id + ' > .received');

    listeningElement.hide();
    receivedElement.show();

    console.log('Received Event: ' + id);
  },
  checkPermissions: function() {
    // We use the permissions plugin
    // It will ask every permission needed by this app
    var permissions = cordova.plugins.permissions;

    // A list with the permission needed
    var list = [
      // The permission to send a SOS SMS
      permissions.SEND_SMS,
      // The permission to access the GPS coordinates
      permissions.ACCESS_COARSE_LOCATION,
      permissions.ACCESS_FINE_LOCATION,
      // The permission to read contacts of the user
      permissions.READ_CONTACTS
    ];

    // We call the function to check every permissions
    permissions.checkPermission(list, askPermission, null);

    // If something went wrong with the permission plugin
    function error() {
      console.warn('Permissions is not turned on');
    }

    // This function use by checkPermission as a callback function
    // Will check the status of a permission
    // If we doesn't have the permission then we made the request
    function askPermission(status) {
      if (!status.hasPermission) {
        permissions.requestPermissions(
          list,
          function(status) {
            if (!status.hasPermission) error();
          },
          error
        );
      }
    }
  },
  // This method will setup the notification
  checkNotification: function() {
    // If the user has chosen to disable the notification
    // Then we exit this method
    if (window.localStorage.getItem('notif') == 'off') return

    // We check if we have the permission to display notification
    cordova.plugins.notification.local.hasPermission(function (granted) {
      // To update the language of the notification
      var lang = window.localStorage.getItem('langue')
      var notif_text = ressources[lang]['notif.text'];
      var notif_close = ressources[lang]['notif.close'];

      // If we do, then we schedule a local notification
      cordova.plugins.notification.local.schedule({
        id: 1, // Id : we can use it to close or cancel this notif later
        title: "112 Rando", // The title
        text: notif_text, // The description
        lockscreen: true, // Display on lockscreen
        ongoing: true, // The user will not be able to dismiss the notification
        icon: 'file://res/icon/android/drawable-hdpi-icon.png',
        smallIcon: 'res://icon/android/drawable-mdpi-icon.png',
        actions: [ // Two actions
          {id: 'SOS', title: 'SOS', launch: true}, // SOS to send a SMS
          {id: 'close', title: notif_close, launch: true} // CLOSE to close the notif
        ]
      });
    });

    // If the user trigger the SOS button on the notification
    cordova.plugins.notification.local.on('SOS', function (notification, eopts) {
      console.log("[NOTIFICATION SOS BUTTON TRIGGER] : " + notification, eopts);
      // Then we call the method to send a SMS
      app.sendSms()
    });

    // If the user trigger the CLOSE button on the notification
    cordova.plugins.notification.local.on('close', function (notification, eopts) {
      console.log("[NOTIFICATION CLOSE BUTTON TRIGGER] : " + notification, eopts);

      // Then we cancel the notification
      cordova.plugins.notification.local.cancel(1, function() {
        console.log("[NOTIFICATION CLOSED]");
      });
    });
  },
  // This method create the database and create one tables 'parcours'
  setupBDD: function() {
    // We open a link to the database
    var randoBDD = window.sqlitePlugin.openDatabase({name: "randoBDD.db", location: 'default'});

    // We make this transaction to create the table 'parcours' if she doesn't exist
    randoBDD.transaction(function(transaction) {
      transaction.executeSql('CREATE TABLE IF NOT EXISTS parcours (id integer primary key, distance real, temps text, vitesse_moyen real, vitesse_max real)', [],
        function(tx, result) {
          console.log("Table created successfully");
        },
        function(error) {
          console.log("Error occurred while creating the table.");
        }
      );
    });
  },
  // This method will simply create an array with every text needed to by translate
  // We can add as many language as we want
  loadTraduction: function() {
    var fr = new Array();
    var en = new Array();

    fr['home.titre'] = "Accueil";
    fr['home.meteo'] = "Météo ";
    fr['home.btn.path'] = "Démarrer un parcours";
    fr['home.btn.stats'] = "Voir les statistiques";
    fr['home.btn.setting'] = "Modifier les paramètres";
    fr['home.btn.contact'] = "Mettre à jour les contacts";
    fr['home.alert_contact_not_provided'] = "Veuillez renseigner un contact pour le bon fonctionnement de l'application";
    fr['home.alert_send_sms'] = "Message d'alerte envoyé";

    fr['path.titre'] = "Parcours";
    fr['path.distance'] = "Distance : ";
    fr['path.average_speed'] = "Vitesse moyenne : ";
    fr['path.max_speed'] = "Vitesse max : ";
    fr['path.alert_database'] = "Parcours enregistré";

    fr['stats.titre'] = "Statistiques";
    fr['stats.total_distance'] = "Distance total parcourus";
    fr['stats.total_time'] = "Temps total (HH:mm:ss)";
    fr['stats.average_speed'] = "Vitesse moyenne globale";
    fr['stats.max_speed'] = "Vitesse max globale";
    fr['stats.list_title_1'] = "Liste des ";
    fr['stats.list_title_2'] = " Parcours";
    fr['stats.more_data'] = "Plus de parcours";

    fr['setting.titre'] = "Paramètres";
    fr['setting.lang'] = "Langage";
    fr['setting.temp'] = "Unité de température";
    fr['setting.reset'] = "Supprimer toutes les données !";
    fr['setting.toast_unit'] = "Changement enregistré !";

    fr['alert_dialog_reset.title'] = "Attention";
    fr['alert_dialog_reset.text'] = "Êtes-vous sûr de supprimer les données de l'application ?";
    fr['alert_dialog_reset.cancel'] = "Annuler";
    fr['alert_dialog_reset.confirm'] = "OK";
    fr['alert_dialog_reset.toast'] = "Données supprimées !";

    fr['contact.titre'] = "Contacts";
    fr['contact.info'] = "Le numéro renseigné ci-dessous recevra un SMS d'alerte quand vous appuierez sur le bouton SOS";
    fr['contact.showContactButton'] = "Choisir parmi vos contacts";
    fr['contact.saveButton'] = "Enregistrer";
    fr['contact.toast_contact'] = "Contact Enregistrer !";
    fr['contact.toast_message'] = "Message Enregistrer !";
    fr['contact.titlePopover'] = "Liste des contacts";
    fr['contact.closePopover'] = "Fermer";

    fr['notif.text'] = "Appuyer sur le bouton SOS si besoin";
    fr['notif.close'] = "FERMER";

    fr['sms.coordinates'] = 'Coordonnées';


    en['home.titre'] = "Home";
    en['home.meteo'] = "Weather ";
    en['home.btn.path'] = "Start a course";
    en['home.btn.stats'] = "See the statistics";
    en['home.btn.setting'] = "Update the settings";
    en['home.btn.contact'] = "Update contacts";
    en['home.alert_contact_not_provided'] = "Please enter a contact for the proper functioning of the application";
    en['home.alert_send_sms'] = "Alert message sent";

    en['path.titre'] = "Path";
    en['path.distance'] = "Distance : ";
    en['path.average_speed'] = "Average speed : ";
    en['path.max_speed'] = "Max speed : ";
    en['path.alert_database'] = "Saved path";

    en['stats.titre'] = "Statistics";
    en['stats.total_distance'] = "Total distance traveled";
    en['stats.total_time'] = "Total time (HH:mm:ss)";
    en['stats.average_speed'] = "Overall average speed";
    en['stats.max_speed'] = "Overall max speed";
    en['stats.list_title_1'] = "List of ";
    en['stats.list_title_2'] = " paths";
    en['stats.more_data'] = "More data";

    en['setting.titre'] = "Settings";
    en['setting.lang'] = "Language";
    en['setting.temp'] = "Temperature unit";
    en['setting.reset'] = "Reset all data !";
    en['setting.toast_unit'] = "Data updated !";

    en['alert_dialog_reset.title'] = "Warning";
    en['alert_dialog_reset.text'] = "Are you sure you want to delete the data from the app ?";
    en['alert_dialog_reset.cancel'] = "Cancel";
    en['alert_dialog_reset.confirm'] = "OK";
    en['alert_dialog_reset.toast'] = "Deleted data ! ";

    en['contact.titre'] = "Contact";
    en['contact.info'] = "The number given below will receive an SMS alert when you press the SOS button";
    en['contact.showContactButton'] = "Choose from your contacts";
    en['contact.saveButton'] = "Save";
    en['contact.toast_contact'] = "Contact Save !";
    en['contact.toast_message'] = "Message Save !";
    en['contact.titlePopover'] = "Contacts list";
    en['contact.closePopover'] = "Close";

    en['notif.text'] = "Press the SOS button if needed";
    en['notif.close'] = "CLOSE";

    en['sms.coordinates'] = 'Coordinates';

    ressources['fr-FR'] = fr;
    ressources['en-EN'] = en;
  },
  // This method will call updateLanguage to update every text of the app
  // With the language chosen by the user or by his phone
  setLanguage: function() {
    // If we already have a language in memory
    // We simply call the function to update ever text
    if (window.localStorage.getItem('langue') != null) {
      app.updateLanguage(window.localStorage.getItem('langue'));
    } else {
      // If we don't have a language in memory
      // We use a plugin that will determine the language of the user phone
      navigator.globalization.getPreferredLanguage(
        function(language) {
          // If we find the language of the user phone
          // We store it and call the function to update the text
          window.localStorage.setItem('langue', language.value);
          app.updateLanguage(language.value);
        },
        // If we don't find the language of the user phone
        // We set the text of this app in French
        function() {
          console.log("Error getting language");
          app.updateLanguage('fr-FR');
        }
      );
    }
  },
  // This method will update the language of this app
  updateLanguage: function(lang) {
    // We store the new language
    window.localStorage.setItem('langue', lang);

    // The grayscale class will modify the picture to be black and white
    // Only the picture of the chosen language will be in color
    $('.flag').addClass('grayscale');
    $('.flag-' + lang).removeClass('grayscale');

    // We recover every text needed to be translate
    $(".translate").each(function(i, element) {
      // We use the language array to update every text with the new language
      $(this).html(ressources[lang][$(this).attr("caption")]);
    });
  },
  // This method allows the menu to open
  open: function() {
    var menu = document.getElementById('menu');
    menu.open();
  },
  // This method will load the page chosen by the user
  load: function(page) {
    var content = document.getElementById('content');
    var menu = document.getElementById('menu');
    content.load(page)
      .then(menu.close.bind(menu));
  },
  // This method will recover the GPS location of the user
  // Then she will send a SMS to the emergency contact save in this app
  sendSms: function() {
    // First we recover the GPS coordinates
    navigator.geolocation.getCurrentPosition(function(position) {

      // We store this data
      window.localStorage.setItem('latitude', position.coords.latitude);
      window.localStorage.setItem('longitude', position.coords.longitude);
      window.localStorage.setItem('altitude', position.coords.altitude);

      // This variable `options` contain the configuration of the SMS
      var options = {
        replaceLineBreaks: false, // true to replace \n by a new line, false by default
        android: {
          //intent: 'INTENT' // send SMS with the native android SMS messaging
          intent: '' // send SMS without opening any other app
        }
      };

      // We recover the message that the user has chosen to send with the SMS
      var message = window.localStorage.getItem('message');

      // To update the language of the message
      var lang = window.localStorage.getItem('langue')
      var coordinates = ressources[lang]['sms.coordinates'];

      // If the user has chosen DD has a GPS unit
      if (window.localStorage.getItem('GPS_unit') == 'DD') {
        // We add the GPS coordinates to the message in DD
        message += "\n" + coordinates + " =>\nLatitude : " + window.localStorage.getItem('latitude')
        message += "\nLongitude : " + window.localStorage.getItem('longitude')

      // Or the user has chosen DMS has a GPS unit
      } else if (window.localStorage.getItem('GPS_unit') == 'DMS') {
        // We convert the GPS coordinates DD to DMS
        const result = app.convertDDToDMS(window.localStorage.getItem('latitude'), window.localStorage.getItem('longitude'))
        const lat = result[0]
        const lng = result[1]

        // We add the GPS coordinates to the message in DMs
        message += "\n" + coordinates + " =>\nLatitude : " + lat
        message += "\nLongitude : " + lng

      // Or the user has chosen to include Google Maps in the message
      } else if (window.localStorage.getItem('GPS_unit') == 'GM') {
        // We add a google maps link with the GPS coordinates
        message += "\n" + coordinates + " => \nhttps://maps.google.fr/maps?q=" + window.localStorage.getItem('latitude');
        message += "," + window.localStorage.getItem('longitude') + "&num=1&t=h&z=19 ";
      }

      // Then we add the altitude in the message
      message += "\nAltitude : " + app.round(window.localStorage.getItem('altitude'), 3);

      // We recover the phone number of the emergency contact
      var numero = window.localStorage.getItem('contact');

      // We call the method send with the SMS plugin to send our SOS
      sms.send(numero, message, options, function() {
        // To update the language of the alert below
        var lang = window.localStorage.getItem('langue')
        var alert_send_sms = ressources[lang]['home.alert_send_sms'];

        // SMS has been send
        alert(alert_send_sms);
      }, function(e) {
        // If the SMS couldn't be send
        console.log("[SEND SMS][ERROR]: " + e);
      });

    // If we can't recover the GPS location
    }, function(error) {
      console.log('[SEND SMS][GET CURRENT POSITION] : [CODE] = ' + error.code + '\n[MESSAGE] = ' + error.message + '\n');
    });
  },
  // This method allows to chose the number of decimals after the comma
  round: function(value, decimals) {
    return Number(Math.round( value + 'e' + decimals ) + 'e-' + decimals)
  },
  // This method take an array as arguments
  // And make the average of this array
  average: function(array) {
  	var n = array.length;
  	var sum = 0;
  	for(i = 0; i < n; i++) {
  		sum += array[i];
  	}
  	var result = sum / n;
  	return result;
  },
  // This method convert the GPS data from DD to DMS
  convertDDToDMS: function(lat, lng) {
    // We convert the latitude
    var convertLat = Math.abs(lat);
    var LatDeg = Math.floor(convertLat);
    var LatMin = (Math.floor((convertLat - LatDeg) * 60));
    var LatSec = Math.round((convertLat - LatDeg - LatMin / 60) * 3600 * 1000) / 1000;
    var LatCardinal = ((lat > 0) ? "N" : "S");

    // We convert the longitude
    var convertLng = Math.abs(lng);
    var LngDeg = Math.floor(convertLng);
    var LngMin = (Math.floor((convertLng - LngDeg) * 60));
    var LngSec = Math.round((convertLng - LngDeg - LngMin / 60) * 3600 * 1000) / 1000;
    var LngCardinal = ((lng > 0) ? "E" : "W");

    // We write the DMS coordinates
    var newLat = LatDeg + '° ' + LatMin + "' " + LatSec + '" ' + LatCardinal
    var newLng = LngDeg + '° ' + LngMin + "' " + LngSec + '" ' + LngCardinal

    // We return the result
    return [newLat, newLng]
  }
};
