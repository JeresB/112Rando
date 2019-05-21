// If we already have a value for contact, we add this value to the field contact
if (window.localStorage.getItem('contact') != null)
  $('#contact').val(window.localStorage.getItem('contact'));

// Same for message
if (window.localStorage.getItem('message') != null)
  $('#message').val(window.localStorage.getItem('message'));

// We use the contacts plugin to search every contacts in the user phone
// Permission : We only do this if the user has agree to it
// This functionnality well be use to help the user find a emergency contact
navigator.contacts.find(
  [navigator.contacts.fieldType.displayName],
  gotContacts,
  searchForContactError);

// This function is called if the contacts plugin has failed
function searchForContactError(e) {
  console.log("[SEARCH FOR CONTACT][ERROR] : " + e);
}

// This function is called when the contacts plugin has find every contacts
function gotContacts(c) {
  // For every contacts we find
  for (var i = 1, len = c.length; i < len; i++) {
    // We check if we have a phone number for every contact
    if (c[i].phoneNumbers != null) {
      // Then we add an element to a list
      // The user will be able to select a emergency contact with this list
      $("#list_contact").append('<ons-list-item class="contact" modifier="longdivider" data="' + c[i].phoneNumbers[0].value + '" tappable>' + c[i].displayName + '</ons-list-item>')
    }
  }
}

// This function when called will show a popover with a list of every contacts find
var showContactListPopover = function(target) {
  document
    .getElementById('contact_list_popover')
    .show(target);
};

// This function will hide the contact list popover
var hideContactListPopover = function() {
  document
    .getElementById('contact_list_popover')
    .hide();
};

// In the contacts list if the user click on one contact then
$("#list_contact").on( "click", ".contact", function(e) {
  // We prevent default behavior of the click
  e.preventDefault()

  // We set the contact value to the one that the user has selected
  $('#contact').val($(this).attr('data'))

  // We hide the contact list popover
  hideContactListPopover()

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
