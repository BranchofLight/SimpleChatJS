/**
 * Purpose: Client side JS
 * Source:  src/client.js
 */

/* TODO:
 * Cookies (saving nicknames + maybe chat log)
 */

$(document).ready(function() {
  var socket = io();
  var username = "";

  $('#usr-form').on('submit', function(event) {
    var $usrBox = $('#usr-box');

    if (confirmInput($usrBox.val())) {
      username = sanitizeInput($usrBox.val());
      socket.emit('usr-req', username);
      console.log("Sent request for username: " + username);
    }

    event.preventDefault();
  });

  $('#msg-form').on('submit', function(event) {
    var $msgBox = $('#msg-box');

    // confirmInput() will return false if length === 0 as well
    if (confirmInput($msgBox.val())) {
      socket.emit('msg-sent', username, $msgBox.val());
      console.log("Sent message: " + $msgBox.val());
      addMessage(username, $msgBox.val());
    }

    $msgBox.val('');

    // Prevents page redirecting on form submit
    event.preventDefault();
  });

  socket.on('msg-sent', function(usr, msg) {
    console.log("Received message: " + msg);
    addMessage(usr, msg);
  });

  socket.on('usr-req', function(acc) {
    console.log("Receiving data about a user request.");
    if (acc.accept) {
      console.log("Username accepted: " + acc.username);
      addUsername(acc.username);
      addMessage("Server", acc.username + " connected.");
      // Check to see if this is what this client requested
      if (username === acc.username) {
        $('#land-overlay').remove();
      }
    } else {
      console.log("Username rejected: " + acc.username);
      $('#username-input').append('<p>Error: username already taken.</p>');
    }
  });

  socket.on('all-users', function(allNames) {
    for (var i = 0; i < allNames.length; ++i) {
      addUsername(allNames[i]);
    }
  });

  socket.on('user-left', function(usr) {
    console.log("A user left. Updating.");
    $('#users-area').children().each(function(index) {
      if ($(this).text() === usr) {
        console.log("Removing user: " + $(this).text());
        addMessage("Server", usr + " disconnected.");
        $(this).remove();
        return;
      }
    });
  });
});

/**
 * Adds message to the approriate location in HTML
 * @param {String} usr
 * @param {String} msg
 */
var addMessage = function(usr, msg) {
  msg = sanitizeInput(msg);
  $('#message-area').append('<li>'+usr+": "+msg+'</li>');
  $('#message-area').animate({
    scrollTop: $('#message-area').prop('scrollHeight')
  });
};

/**
 * Adds user to the approriate location in HTML
 * @param {String} usr
 */
var addUsername = function(usr) {
  // usr is already sanitized before sending to the server initially
  $('#users-area').append('<li>'+usr+'</li>');
};

/**
 * Sanitizes the input of any characters that may cause harm in their normal form
 * @param {String} msg
 */
var sanitizeInput = function(input) {
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

  return String(input.replace(/[&<>"'`=\/]/g, function(s) { return entityMap[s]; }));
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
