if (window.localStorage.getItem('contact') != null)
  $('#contact').val(window.localStorage.getItem('contact'));

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
  console.log("gotContacts, number of results " + c.length);
  for (var i = 0, len = c.length; i < len; i++) {
    console.dir(c[i]);
  }
}

function saveContacts() {
  var contact = $('#contact').val();

  contactToast.toggle();

  window.localStorage.setItem('contact', contact);
}

function saveMessage() {
  var message = $('#message').val();

  messageToast.toggle();

  window.localStorage.setItem('message', message);
}
