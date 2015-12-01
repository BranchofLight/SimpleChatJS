/**
 * Purpose: Client side JS
 * Source:  src/client.js
 */

/* TODO:
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

    // Since msg-box is cleared regardless, emit not-typing event
    console.log("User is no longer typing");
    socket.emit('usr-not-typing', username);
    removeIsTyping(username);

    // Prevents page redirecting on form submit
    event.preventDefault();
  });

  $('#msg-box').on('input', function() {
    if (confirmInput($('#msg-box').val())) {
      console.log("User is typing");
      socket.emit('usr-typing', username);
      addIsTyping(username);
    } else {
      console.log("User is no longer typing");
      socket.emit('usr-not-typing', username);
      removeIsTyping(username);
    }
  });

  socket.on('usr-typing', function(usr) {
    console.log("Attempting to add 'is typing' status: " + usr);
    addIsTyping(usr);
  });

  socket.on('usr-not-typing', function(usr) {
    console.log("Attempting to remove 'is typing' status: " + usr);
    removeIsTyping(usr);
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
      addServerMsg(acc.username + " connected.");
      // Check to see if this is what this client requested
      if (username === acc.username) {
        $('#land-overlay').remove();

        // Set/Update a cookie to expire in 10 years
        var expires = 10 * 365 * 24 * 60 * 60;
        $.cookie("username", acc.username, {
          expires: expires,
          path: '/'
        });
      }
    } else {
      console.log("Username rejected: " + acc.username);
      var msg;
      if (!$('#username-input #err').length) {
        console.log("Reason: " + acc.reason);
        msg = (acc.reason === "len") ? "username must be less than 14 characters." : "username already taken.";
        $('#username-input').append('<p id=\"err\">Error: ' + msg + '</p>');
      } else {
        $('#username-input #err').fadeOut("fast", function() {
          $('#username-input #err').remove();
          console.log("Reason: " + acc.reason);
          msg = (acc.reason === "len") ? "username must be less than 14 characters." : "username already taken.";
          $('#username-input').append('<p id=\"err\">Error: ' + msg + '</p>');
          $('#username-input #err').fadeIn("fast");
        });
      }
    }
  });

  socket.on('all-users', function(allNames) {
    for (var i = 0; i < allNames.length; ++i) {
      addUsername(allNames[i]);
    }
  });

  socket.on('user-left', function(usr) {
    console.log("A user left. Updating.");
    var $usr = findUserHTML(usr);
    if ($usr !== undefined) {
      console.log("Removing user: " + $usr.text());
      addServerMsg(usr + " disconnected.");
      $usr.remove();
    }
  });

  socket.on('cookie-usr', function(usr) {
    console.log("Cookie username found.");
    $('#usr-box').val(usr);
  });
});

/**
 * Find the user in users-area and return the Jquery obj assosiated
 * @param {String} usr
 * @return {JQuery} this or undefined
 */
var findUserHTML = function(usr) {
  var $match;
  $('#users-area').children().each(function() {
    if ($(this).text() === usr) {
      $match = $(this);
      // Breaks out of each()
      return false;
    }
  });

  return $match;
};

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
 * Adds server message
 * @param {String} msg
 */
var addServerMsg = function(msg) {
  $('#message-area').append("<li class=\"server-msg\">Server: " + msg + "</li>");
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

/**
 * Adds "is typing" to username
 * @param {String} usr
 */
var addIsTyping = function(usr) {
  var $usr = findUserHTML(usr);
  if ($usr !== undefined)
    $usr.html($usr.text() + "<span class=\"typing\">is typing</span>");
};

/**
 * Removes "is typing" to username
 * @param {String} usr
 */
var removeIsTyping = function(usr) {
  // Must account for "is typing" appended
  var $usr = findUserHTML(usr + "is typing");
  if ($usr !== undefined)
    $usr.text($usr.text().replace("is typing", ""));
};
