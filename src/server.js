/**
 * Purpose: NodeJS Server
 * Source:  src/server.js
 */

/* TODO:
 */

var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(process.env.PORT || 3000);

var users = [];
var cookieUsername;

// Initialize middleware for using cookies
app.use(cookieParser());

app.get('/', function(request, response) {
  // Serve static files (html, css, js) from the current directory
  app.use(express.static(__dirname));

  console.log("Cookies: ", request.cookies);
  if (request.cookies.username !== undefined)
    cookieUsername = request.cookies.username;

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

  // Create user object with id
  users.push( {id: socket.id });
  // Emit event for cookie user
  if (cookieUsername !== undefined) {
    io.to(id).emit('cookie-usr', cookieUsername);
  }
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
    // Limit length to 14 characters
    if (findUser(usr) > -1 || usr.length > 14) {
      console.log("Rejecting user: " + usr);
      // If user is rejected just let that client know
      io.to(id).emit('usr-req', {
        username: usr,
        accept: false,
        reason: (usr.length > 14) ? "len" : "exists"
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

  socket.on('usr-typing', function(usr) {
    socket.broadcast.emit('usr-typing', usr);
  });

  socket.on('usr-not-typing', function(usr) {
    socket.broadcast.emit('usr-not-typing', usr);
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
