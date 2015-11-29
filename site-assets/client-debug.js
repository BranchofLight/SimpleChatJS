/**
 * Purpose: Client side JS
 * Source:  src/client.js
 */

/* TODO:
 * Nicknames
 * Cookies (saving nicknames + maybe chat log)
 */

$(document).ready(function() {
  var socket = io();

  $('form').on('submit', function(event) {
    var $msgBox = $('#msg-box');
    /**
		 * Returns whether or not $msgBox's input is valid
		 * @return {Bool}
		 */
    var confirmInput = function() {
      var str = $msgBox.val();
      for (var c in str) {
        if (str[c] !== ' ')
          return true;
      }

      return false;
    };

    // confirmInput() will return false if length === 0 as well
    if (confirmInput()) {
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
  $('#message-area').append('<li>'+msg+'</li>');
  $('#message-area').animate({
    scrollTop: $('#message-area').prop('scrollHeight')
  });
};
