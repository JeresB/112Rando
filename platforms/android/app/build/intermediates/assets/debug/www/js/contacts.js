// If we already have a value for contact, we add this value to the field contact
if (window.localStorage.getItem('contact') != null)
  $('#contact').val(window.localStorage.getItem('contact'));

// Same for message
if (window.localStorage.getItem('message') != null)
  $('#message').val(window.localStorage.getItem('message'));

navigator.contacts.find(
  [navigator.contacts.fieldType.displayName],
  gotContacts,
  errorHandler);

function errorHandler(e) {
  console.log("errorHandler: " + e);
}

function gotContacts(c) {
  //console.log("gotContacts, number of results " + c.length);
  for (var i = 1, len = c.length; i < len; i++) {
    console.dir(c[i]);
    if (c[i].phoneNumbers != null) {
      console.log(c[i].phoneNumbers[0].value);
      $("#list_contact").append('<ons-list-item class="contact" modifier="longdivider" data="' + c[i].phoneNumbers[0].value + '" tappable>' + c[i].displayName + '</ons-list-item>')
    }
  }
}

var showPopover = function(target) {
  document
    .getElementById('popover')
    .show(target);
};

var hidePopover = function() {
  document
    .getElementById('popover')
    .hide();
};

$("#list_contact").on( "click", ".contact", function(e) {
  e.preventDefault()

  $('#contact').val($(this).attr('data'))

  hidePopover()

  saveContacts()
});

// This function is call when the user press the button save contact
function saveContacts() {
  // We gather the contact value
  var contact = $('#contact').val();

  // Then we toggle the contact toast
  // This toast is a message for the user to tell him that is request have been done
  contactToast.toggle();

  // We store the new contact value in storage
  window.localStorage.setItem('contact', contact);
}

// This function is call when the user press the button save message
function saveMessage() {
  // We gather the message value
  var message = $('#message').val();

  // Then we toggle the message toast
  // This toast is a message for the user to tell him that is request have been done
  messageToast.toggle();

  // We store the new message value in storage
  window.localStorage.setItem('message', message);
}
