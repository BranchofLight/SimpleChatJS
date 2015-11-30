/**
 * Purpose: Client side JS
 * Source:  src/client.js
 */

/* TODO:
 * Nicknames (li color based on nickname?)
 * Cookies (saving nicknames + maybe chat log)
 */

$(document).ready(function() {
  var socket = io();

  $('#usr-form').on('submit', function(event) {
    var $usrBox = $('#usr-box');

    if (confirmInput($usrBox.val())) {
      socket.emit('usr-req', $usrBox.val());
      console.log("Sent request for username: " + $usrBox.val());
    }
  });

  $('#msg-form').on('submit', function(event) {
    var $msgBox = $('#msg-box');

    // confirmInput() will return false if length === 0 as well
    if (confirmInput($msgBox.val())) {
      socket.emit('msg-sent', $msgBox.val());
      console.log("Sent message: " + $msgBox.val());
      addMessage($msgBox.val());
    }

    $msgBox.val('');

    // Prevents page redirecting on form submit
    event.preventDefault();
  });

  socket.on('msg-sent', function(msg) {
    console.log("Received message: " + msg);
    addMessage(msg);
  });
});

/**
 * Adds message to the approriate location in HTML
 * @param {String} msg
 */
var addMessage = function(msg) {
  msg = sanitizeMsg(msg);
  $('#message-area').append('<li>'+msg+'</li>');
  $('#message-area').animate({
    scrollTop: $('#message-area').prop('scrollHeight')
  });
};

/**
 * Sanitizes the message of any characters that may cause harm in their normal form
 * @param {String} msg
 */
var sanitizeMsg = function(msg) {
  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return String(msg.replace(/[&<>"'`=\/]/g, function(s) { return entityMap[s]; }));
};

/**
 * Returns whether or not a user's input is valid via a basic test
 * Should be treated as a first pass test. Only checks if any characters
 * were entered.
 * @param {String} input
 * @return {Bool}
 */
var confirmInput = function(input) {
  for (var c in input) {
    if (input[c] !== ' ')
      return true;
  }

  return false;
};
