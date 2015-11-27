/**
 * Purpose: NodeJS Server
 * Source:  src/server.js
 */

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var htmlDir = __dirname + "/html/";

app.get('/', function(request, response) {
  response.sendFile(htmlDir + "index.html");
});

io.on('connection', function(socket) {
  console.log("A user connected.");
  socket.on('chat-message', function(msg) {
    io.emit('chat-message', msg);
  });
});

http.listen(3000, function() {
  console.log("Listening on :3000");
});
