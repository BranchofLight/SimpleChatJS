/**
 * Purpose: NodeJS Server
 * Source:  src/server.js
 */

/* TODO:
 * Nicknames
 * Cookies (saving nicknames + maybe chat log)
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Used to allow index.html to load resources as well
app.use(express.static(__dirname));

app.get('/', function(request, response) {
  response.sendFile(__dirname + "/index.html");
});

io.on('connection', function(socket) {
  console.log("User connected.");
  socket.on('msg-sent', function(msg) {
    socket.broadcast.emit('msg-sent', msg);
    console.log("Recieved message: " + msg);
    console.log("Sending it to every other connection.");
  });
});

http.listen(3000, function() {
  console.log("Listening on :3000");
});
