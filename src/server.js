/**
 * Purpose: NodeJS Server
 * Source:  src/server.js
 */

/* TODO:
 * Cookies (saving nicknames + maybe chat log)
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];

// Serve static files (css, js) from the current directory
app.use(express.static(__dirname));

app.get('/', function(request, response) {
  console.log("hello");

  console.log(request.cookies.length + " cookies found.");

  for (var i = 0; i < request.cookies.length; ++i) {
    console.log("Cookie: " + request.cookies.cookieName);
  }

  response.sendFile(__dirname + "/index.html");  
});

io.on('connection', function(socket) {
  console.log("A user connected: " + socket.id);
  // This id is preserved and used in socket.on('disconnect')
  var id = socket.id;

  /**
   * Send all connected usernames to the newly connected client
   * so they may update their view
   */
  var sendAllNames = function() {
    var allNames = [];
    for (var i = 0; i < users.length; ++i) {
      if (users[i].username !== undefined)
        allNames.push(users[i].username);
    }

    io.to(id).emit('all-users', allNames);
  }();

  // Create user object with id set
  users.push( {id: socket.id });
  console.log("All socket ids: " + function() {
    var s = "";
    for (var i = 0; i < users.length; ++i) {
      s += users[i].id + ', ';
    }
    return s;
  }());

  socket.on('msg-sent', function(usr, msg) {
    console.log("Received message: " + msg);
    console.log("Received from: " + usr);
    console.log("Broadcasting message.");
    socket.broadcast.emit('msg-sent', usr, msg);
  });

  socket.on('usr-req', function(usr) {
    console.log("Username requested: " + usr);
    if (findUser(usr) > -1) {
      console.log("Rejecting user: " + usr);
      console.log("Username is in use.");
      // If user is rejected just let that client know
      io.to(id).emit('usr-req', {
        username: usr,
        accept: false
      });
    } else {
      console.log("Accepting user: " + usr);
      // Should not return -1 but checked just in case something is wrong
      var index = findId(id);
      if (index > -1) {
        console.log("Adding username to list: (" + index + ", " + usr + ")");
        users[index].username = usr;
        // If user is accepted we must update every client
        io.emit('usr-req', {
          username: usr,
          accept: true
        });
      }
    }

    console.log("All usernames: " + function() {
      var s = "";
      for (var i = 0; i < users.length; ++i) {
        s += users[i].username + ', ';
      }
      return s;
    }());
  });

  socket.on('disconnect', function() {
    console.log("A user disconnected: " + id);
    var index = findId(id);
    if (index > -1) {
      // Let everyone else know this user is leaving so they can
      // update their client view
      socket.broadcast.emit('user-left', users[index].username);
      users.splice(index, 1);
    }

    console.log("All socket ids: " + function() {
      var s = "";
      for (var i = 0; i < users.length; ++i) {
        s += users[i].id + ', ';
      }
      return s;
    }());
    console.log("All usernames: " + function() {
      var s = "";
      for (var i = 0; i < users.length; ++i) {
        s += users[i].username + ', ';
      }
      return s;
    }());
  });
});

http.listen(3000, function() {
  console.log("Listening on :3000");
});

/**
 * Finds the index of the matching socket id in users
 * @param {String} id
 * @return {Number} i or -1
 */
var findId = function(id) {
  for (var i = 0; i < users.length; ++i) {
    if (users[i].id === id)
      return i;
  }

  // Return if not found
  return -1;
};

/**
 * Finds the index of the matching username in users
 * @param {String} usr
 * @return {Number} i or -1
 */
var findUser = function(usr) {
  for (var i = 0; i < users.length; ++i) {
    if (users[i].username === usr)
      return i;
  }

  // Return if not found
  return -1;
};
