/**
 * Purpose: NodeJS Server
 * Source:  src/server.js
 */

/* TODO:
 * Nicknames (li color based on nickname?)
 * Cookies (saving nicknames + maybe chat log)
 */

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var htmlDir = __dirname + "/html/";

var usersConnected = [];

app.get('/', function(request, response) {
  response.sendFile(htmlDir + "index.html");
});

io.on('connection', function(socket) {
  console.log("A user connected.");
  socket.on('chat-message', function(msg) {
    io.emit('chat-message', msg);
  });

  socket.on('usr-req', function(usr) {
    console.log("Username requested: " + usr);
    if (usersConnected.indexOf(usr) > -1) {
      console.log("Refusing user: " + usr);
      console.log("Username is in use.");
      /* TODO:
       * Gives users unique socket id on connect http://stackoverflow.com/questions/10110411/node-js-socket-io-how-to-emit-to-a-particular-client
       * Make sure to handle removing id on disconnect
       * Finish nicknames
       */
    }
  });
});

http.listen(3000, function() {
  console.log("Listening on :3000");
});
