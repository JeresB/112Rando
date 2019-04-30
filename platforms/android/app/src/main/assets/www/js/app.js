var ressources = new Array();
var app = {
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  onDeviceReady: function() {
    app.receivedEvent('deviceready');
    navigator.splashscreen.hide();
    app.checkPermissions();
    app.loadTraduction();
    app.setLanguage();
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
    var permissions = cordova.plugins.permissions;

    var list = [
      permissions.SEND_SMS,
      permissions.ACCESS_COARSE_LOCATION,
      permissions.ACCESS_FINE_LOCATION,
      permissions.READ_CONTACTS
    ];

    permissions.checkPermission(list, askPermission, null);

    function error() {
      console.warn('Permissions is not turned on');
    }

    function askPermission(status) {
      if (!status.hasPermission) {

        permissions.requestPermissions(
          list,
          function(status) {
            if (!status.hasPermission) error();
          },
          error);
      }
    }
  },
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
    fr['contact.titre'] = "Contacts";
    fr['contact.saveButton'] = "Enregistrer";
    fr['contact.toast_contact'] = "Contact Enregistrer !";
    fr['contact.toast_message'] = "Message Enregistrer !";

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
    en['contact.titre'] = "Contact";
    en['contact.saveButton'] = "Save";
    en['contact.toast_contact'] = "Contact Save !";
    en['contact.toast_message'] = "Message Save !";

    ressources['fr-FR'] = fr;
    ressources['en-EN'] = en;
  },
  setLanguage: function() {
    // On récupère la langue de l'utilisateur
    if (window.localStorage.getItem('langue') != null) {
      app.updateLanguage(window.localStorage.getItem('langue'));
    } else {
      navigator.globalization.getPreferredLanguage(
        function(language) {
          window.localStorage.setItem('langue', language.value);
          app.updateLanguage(language.value);
        },
        function() {
          console.log("Error getting language");
        }
      );
    }
  },
  updateLanguage: function(lang) {
    window.localStorage.setItem('langue', lang);

    $('.flag').addClass('grayscale');
    $('.flag-' + lang).removeClass('grayscale');

    $(".translate").each(function(i, element) {
      $(this).html(ressources[lang][$(this).attr("caption")]);
    });
  },
  open: function() {
    var menu = document.getElementById('menu');
    menu.open();
  },
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
      message += " Coordonnées => https://maps.google.fr/maps?q=" + window.localStorage.getItem('latitude');
      message += "," + window.localStorage.getItem('longitude') + "&num=1&t=h&z=19 ";
      message += "\naltitude : " + window.localStorage.getItem('altitude');

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
  debug: function() {
    console.log("window.localStorage.getItem('langue') = " + window.localStorage.getItem('langue'));
    console.log("Ressources = " + ressources);
  }
};
