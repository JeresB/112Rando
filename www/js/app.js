// We declare an array
// That we will use to store every language of every text for this app
var ressources = new Array();

// We create a prototype function that will
// allow us to convert any number into radian
Number.prototype.toRad = function() {
  return this * Math.PI / 180
}

var startPos = null
var distance = 0
var unit = ''
var timeId = null
var Timeout = null

$.getScript('js/timeout.js', function() {});

// We declare to app object
var app = {
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  onDeviceReady: function() {
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

    if (window.localStorage.getItem('contact') == null || window.localStorage.getItem('contact') == '') {
      alert("Veuillez renseigner un contact pour le bon fonctionnement de l'application")
      app.load('contact.html')
    }
  },
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
  checkNotification: function() {
    if (window.localStorage.getItem('notif') == 'off') return

    cordova.plugins.notification.local.hasPermission(function (granted) {
      cordova.plugins.notification.local.schedule({
        id: 1,
        title: "112 Rando",
        text: "Appuyer sur le bouton SOS si besoin",
        lockscreen: true,
        ongoing: true,
        icon: 'file://res/icon/android/drawable-hdpi-icon.png',
        smallIcon: 'file://res/icon/android/drawable-mdpi-icon.png',
        actions: [
          {id: 'SOS', title: 'SOS', launch: true},
          {id: 'close', title: 'CLOSE', launch: true}
        ]
      });
    });

    cordova.plugins.notification.local.on('SOS', function (notification, eopts) {
      console.log("[NOTIFICATION SOS BUTTON TRIGGER] : " + notification, eopts);
      app.sendSms()
    });

    cordova.plugins.notification.local.on('close', function (notification, eopts) {
      console.log("[NOTIFICATION CLOSE BUTTON TRIGGER] : " + notification, eopts);

      cordova.plugins.notification.local.cancel(1, function() {
        console.log("[NOTIFICATION CLOSED]");
      });
    });
  },
  setupBDD: function() {
    var randoBDD = window.sqlitePlugin.openDatabase({name: "randoBDD.db", location: 'default'});

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
  // This function will simply create an array with every text needed to by translate
  // We can add as many language as we want
  loadTraduction: function() {
    var fr = new Array();
    var en = new Array();

    fr['home.titre'] = "Accueil";
    fr['home.meteo'] = "Météo";
    fr['home.btn.path'] = "Démarrer un parcours";
    fr['home.btn.stats'] = "Voir les statistiques";
    fr['home.btn.setting'] = "Modifier les paramètres";
    fr['home.btn.contact'] = "Mettre à jour les contacts";

    fr['path.titre'] = "Parcours";

    fr['stats.titre'] = "Statistiques";

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
    fr['contact.showContactButton'] = "Choisir parmi vos contacts";
    fr['contact.saveButton'] = "Enregistrer";
    fr['contact.toast_contact'] = "Contact Enregistrer !";
    fr['contact.toast_message'] = "Message Enregistrer !";
    fr['contact.titlePopover'] = "Liste des contacts";
    fr['contact.closePopover'] = "Fermer";


    en['home.titre'] = "Home";
    en['home.meteo'] = "Weather";
    en['home.btn.path'] = "Start a course";
    en['home.btn.stats'] = "See the statistics";
    en['home.btn.setting'] = "Update the settings";
    en['home.btn.contact'] = "Update contacts";

    en['path.titre'] = "Path";

    en['stats.titre'] = "Statistics";

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
    en['contact.showContactButton'] = "Choose from your contacts";
    en['contact.saveButton'] = "Save";
    en['contact.toast_contact'] = "Contact Save !";
    en['contact.toast_message'] = "Message Save !";
    en['contact.titlePopover'] = "Contacts list";
    en['contact.closePopover'] = "Close";

    ressources['fr-FR'] = fr;
    ressources['en-EN'] = en;
  },
  // This function will call updateLanguage to update every text of the app
  // With the language choosen by the user or by his phone
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
  // This function will update the language of this app
  updateLanguage: function(lang) {
    // We store the new language
    window.localStorage.setItem('langue', lang);

    // The grayscale class will modify the picture to be black and white
    // Only the picture of the choosen language will be in color
    $('.flag').addClass('grayscale');
    $('.flag-' + lang).removeClass('grayscale');

    // We recover every text needed to be translate
    $(".translate").each(function(i, element) {
      // We use the language array to update every text with the new language
      $(this).html(ressources[lang][$(this).attr("caption")]);
    });
  },
  // This function allows the menu to open
  open: function() {
    var menu = document.getElementById('menu');
    menu.open();
  },
  // This function will load the page choosen by the user
  load: function(page) {
    var content = document.getElementById('content');
    var menu = document.getElementById('menu');
    content.load(page)
      .then(menu.close.bind(menu));
  },
  sendSms: function() {
    navigator.geolocation.getCurrentPosition(function(position) {
      window.localStorage.setItem('latitude', position.coords.latitude);
      window.localStorage.setItem('longitude', position.coords.longitude);
      window.localStorage.setItem('altitude', position.coords.altitude);

      // CONFIGURATION
      var options = {
        replaceLineBreaks: false, // true to replace \n by a new line, false by default
        android: {
          //intent: 'INTENT' // send SMS with the native android SMS messaging
          intent: '' // send SMS without opening any other app
        }
      };

      var message = window.localStorage.getItem('message');

      if (window.localStorage.getItem('GPS_unit') == 'DD') {
        message += "\nCoordonnées =>\nLatitude : " + window.localStorage.getItem('latitude')
        message += "\nLongitude : " + window.localStorage.getItem('longitude')
      } else if (window.localStorage.getItem('GPS_unit') == 'DMS') {
        const result = app.convertDDToDMS(window.localStorage.getItem('latitude'), window.localStorage.getItem('longitude'))
        const lat = result[0]
        const lng = result[1]

        message += "\nCoordonnées =>\nLatitude : " + lat
        message += "\nLongitude : " + lng
      } else if (window.localStorage.getItem('GPS_unit') == 'GM') {
        message += "\nCoordonnées => \nhttps://maps.google.fr/maps?q=" + window.localStorage.getItem('latitude');
        message += "," + window.localStorage.getItem('longitude') + "&num=1&t=h&z=19 ";
      }

      message += "\nAltitude : " + app.round(window.localStorage.getItem('altitude'), 3);

      console.log("Message = " + message);

      var numero = window.localStorage.getItem('contact');

      sms.send(numero, message, options, function() {
        alert("Message d'alerte envoyé");
      }, function(e) {
        alert("Message non envoyé : " + e);
      });

    }, function(error) {
      console.log('code: ' + error.code + '\nmessage: ' + error.message + '\n');
    });
  },
  // This function allows to choose the number of decimals after the comma
  round: function(value, decimals) {
    return Number(Math.round( value + 'e' + decimals ) + 'e-' + decimals)
  },
  average: function(array) {
  	var n = array.length;
  	var sum = 0;
  	for(i = 0; i < n; i++) {
  		sum += array[i];
  	}
  	var result = sum / n;
  	return result;
  },
  convertDDToDMS: function(lat, lng) {
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
  },
  debug: function() {
    console.log("window.localStorage.getItem('langue') = " + window.localStorage.getItem('langue'));
    console.log("Ressources = " + ressources);
  }
};
