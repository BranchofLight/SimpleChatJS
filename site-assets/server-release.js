var express=require("express"),cookieParser=require("cookie-parser"),app=express(),server=require("http").createServer(app),io=require("socket.io").listen(server);server.listen(process.env.PORT||3e3);var users=[],cookieUsername;app.use(cookieParser()),app.get("/",function(a,b){app.use(express["static"](__dirname)),console.log("Cookies: ",a.cookies),void 0!==a.cookies.username&&(cookieUsername=a.cookies.username),b.sendFile(__dirname+"/index.html")}),io.on("connection",function(a){console.log("A user connected: "+a.id);var b=a.id;(function(){for(var a=[],c=0;c<users.length;++c)void 0!==users[c].username&&a.push(users[c].username);io.to(b).emit("all-users",a)})();users.push({id:a.id}),void 0!==cookieUsername&&io.to(b).emit("cookie-usr",cookieUsername),console.log("All socket ids: "+function(){for(var a="",b=0;b<users.length;++b)a+=users[b].id+", ";return a}()),a.on("msg-sent",function(b,c){console.log("Received message: "+c),console.log("Received from: "+b),console.log("Broadcasting message."),a.broadcast.emit("msg-sent",b,c)}),a.on("usr-req",function(a){if(console.log("Username requested: "+a),findUser(a)>-1||a.length>14)console.log("Rejecting user: "+a),io.to(b).emit("usr-req",{username:a,accept:!1,reason:a.length>14?"len":"exists"});else{console.log("Accepting user: "+a);var c=findId(b);c>-1&&(console.log("Adding username to list: ("+c+", "+a+")"),users[c].username=a,io.emit("usr-req",{username:a,accept:!0}))}console.log("All usernames: "+function(){for(var a="",b=0;b<users.length;++b)a+=users[b].username+", ";return a}())}),a.on("usr-typing",function(b){a.broadcast.emit("usr-typing",b)}),a.on("usr-not-typing",function(b){a.broadcast.emit("usr-not-typing",b)}),a.on("disconnect",function(){console.log("A user disconnected: "+b);var c=findId(b);c>-1&&(a.broadcast.emit("user-left",users[c].username),users.splice(c,1)),console.log("All socket ids: "+function(){for(var a="",b=0;b<users.length;++b)a+=users[b].id+", ";return a}()),console.log("All usernames: "+function(){for(var a="",b=0;b<users.length;++b)a+=users[b].username+", ";return a}())})});var findId=function(a){for(var b=0;b<users.length;++b)if(users[b].id===a)return b;return-1},findUser=function(a){for(var b=0;b<users.length;++b)if(users[b].username===a)return b;return-1};