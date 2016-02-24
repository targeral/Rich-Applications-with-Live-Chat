var koa = require('koa'); 
var logger = require('koa-logger');
var koaStatic = require('koa-static');
var router  = require('koa-router')();
var koaBody   = require('koa-body');
var mongo = require('koa-mongo');
var session = require('koa-session');
var app = koa();
var server = require('http').createServer(app.callback());
var User = require('./models/user.js');
var DB = require('./models/db.js');
var router = require('./router/router.js');
var io = require('socket.io').listen(server);

app.use(koaStatic(__dirname + "/public/"));
app.use(koaBody());

/*router.post('/login', koaBody, function *() {
    var response = this.response;
    var data = JSON.stringify(this.request.body);
    this.body = data;
    User.get(data['account'], function(err, user) {
        if(!user) {
            this.body = "没有这个账号";
            return ;
        }
        if(user.password != data['password']) {
            response.body = "密码错误";
            return ;
        }
        console.log(user);
    });
    console.log(data);
});*/

/*app.use(router.routes());
*/

var onlineUsers = {};
var onlineCount = 0;
var roomInfo = {};
var ioroom = {};

io.on('connection', function(socket) {
    console.log('connection');

    socket.on('login', function(obj) {
        socket.name = obj.id;
        if(!onlineUsers.hasOwnProperty(obj.id)) {
            onlineUsers[obj.id] = obj;
            onlineCount++;
        }

        io.emit('login', {onlineUsers : onlineUsers, onlineCount : onlineCount, user : obj});
        console.log(obj.name + "加入聊天室");
    }); 

    socket.on('logout', function(id) {
        console.log(id);
        if(onlineUsers.hasOwnProperty(id)) {
            var obj = {id : id, user : onlineUsers[id]};

            delete onlineUsers[id];
            onlineCount --;
            console.log(obj.user.name + "leave");
            io.emit('logout', {onlineUsers : onlineUsers, onlineCount : onlineCount, user : obj.user});
        }
    });

    socket.on('message', function(obj) {
        io.emit('message', obj);
        console.log(obj.user.name + "say:" + obj.content);
    });

    socket.on('disconnect', function() {
        console.log("disconnect");
        var id = socket.name;
        if(onlineUsers.hasOwnProperty(id)) {
            var obj = {id : id, user : onlineUsers[id]};

            delete onlineUsers[id];
            onlineCount --;
            console.log(obj.user.name + "leave");
            io.emit('logout', {onlineUsers : onlineUsers, onlineCount : onlineCount, user : obj.user});
        }
    }); 

    socket.on('chatBuild', function(CO) {
        var roomId = CO.room;
        if(!roomInfo[roomId]) {
            roomInfo[roomId] = [];
        }
        roomInfo[roomId].push(CO.from);
        if(!ioroom[CO.from]) {
            ioroom[CO.room] = io.of(roomId);
        }
        console.log(CO.room);

        ioroom[CO.room].on('connection', function(socket) {
            console.log("room connection");
            socket.on('msg', function(CO, msg) {
                console.log(msg);
                console.log(CO.room);
                ioroom[CO.room].emit("msg", CO, msg);
            });

            //socket.emit("haha", "haha");
        });

        socket.join(roomId);
        console.log(CO.from + "加入" + CO.room);


        io.emit("chatSys", CO);
    });

    socket.on('join', function(CO) {
        var roomId = CO.room;
        roomInfo[roomId].push(CO.to);

        socket.join(roomId);
        console.log(CO.to + "join" + CO.room);
    });

    socket.on('chatSuccess', function(CO) {
        var roomId = CO.room;
        roomInfo[roomId].push(CO.to);

        socket.join(roomId);
        console.log(CO.to + "加入");
    });

    socket.on('chatMsg', function(CO, msg) {
        console.log(CO.room);
        socket.to( CO.room).emit('msg', CO, msg);
    });
});

server.listen(3000);
//server.listen(3000);
console.log("listen 3000");