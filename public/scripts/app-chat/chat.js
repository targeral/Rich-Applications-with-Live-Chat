define(['util', 'eventemitter', 'socket', 'app-chat/model/user', 'app-chat/controller/chat_frame', 'app-chat/model/member', 'app-chat/controller/chat_member', 'app-chat/controller/chat_box', 'app-chat/model/session', 'app-chat/controller/chat_session', 'app-chat/model/login', 'app-chat/controller/chat_login'], function(util, Event, io, User, Chat_frame, Member, Chat_member, Chat_box, Session, Chat_session, Login, Chat_login) {
    var _ = util;

    function Chat(el) { 
        this.el = _.$(el);
        this.ioroom = {};
        this.msgArr = {};
        this.isOpen = {};
    }

    Chat.prototype = {
        elements : {
            "$login" : "#login",
            "$chat_header" : ".chat-header",
            "$friend" : "section[data-face=friend]",
            "$chats" : "section[data-face=chats]",
            "$session" : "section[data-face=session]"
        },

        room : {}
    };

    Chat = _.eventify(Chat, Event);

    _.include(Chat, {
        init : function() {
            this._initDom();
            this._initLogin();
            this._initLoginEvent();
        },

        _initDom : function() {
            for(var key in this.elements) {
                this[ key ] = _.$( this.elements[ key ], this.el );
            }
        },

        _initLogin : function() {
            this.chat_login = new Chat_login(this.$login, Login);
            this.chat_login.init();

            this.chat_login.on("log", function(data) {
                this.emit("log", data);
                this.el.classList.remove("logout");
            }.bind(this));
        },

        _initLoginEvent : function() {
            this.on('log', this.log.bind(this));
        },

        log : function(data) {
            this._initChat_frame(data);
            this._initSocket();
            this._initChat_box();
            this._initSession();
            this._initEvent();
        },

        _initChat_frame : function(data) {
            var id;
            if(data.sex === "man") {
                id = _.random(1, 3);
            }else {
                id = _.random(4,3);
            }
            this.user = new User(data.account, "img/pic" + id + ".jpg", data.sign);
            this.chat_frame = new Chat_frame(this.$chat_header, this.user);
            this.chat_frame.init();
            this.chat_frame.on('tabChange', function(id) {
                console.log("chat_frame" + id);
                this.emit('tabChange', id);
            }.bind(this));
            this.chat_frame.on("leave", function() {
                this.emit("logout");
                this.el.classList.add("logout");
            }.bind(this));
        },

        _initMember : function(o) {
            this.member = new Member(o.onlineUsers, o.onlineCount);
            this.chat_member = new Chat_member(this.$friend, this.member);
            this.chat_member.init();
            this.chat_member.on("addsession", function(data) {
                console.log("chat_member");
                console.log(data);
                this.emit("addsession", data);
            }.bind(this));

            this.chat_member.on("chatBuild", function(To) {

                this.emit("chatBuild", To);
            }.bind(this));

            this.chat_member.on("chatBuilded", function(From) {
                if( this.isOpen[From] === undefined) {
                    this.isOpen[From] = false;
                }
                this.isOpen[From] = true;
                var CO = {}, msg;
                CO.from = From;
                CO.box = From;
                if( !this.msgArr[From] ) {
                    return ;
                }
                for(var i = 0, il = this.msgArr[From].length; i < il; i++) {
                    msg = this.msgArr[From][i];
                    this.chat_member.emit("cmsg", "other", CO, msg);
                }
            }.bind(this));

            this.chat_member.on("chatMsg", function(content, id) {
                this.emit("chatMsg", content, id);
            }.bind(this));
        },

        _initChat_box : function() {
            this.chat_box = new Chat_box(this.$chats);
            this.chat_box.init();
            this.chat_box.on("sendMsg", function(content) {
                this.emit("message", content);
            }.bind(this));
        },

        _initSession : function() {
            this.session = new Session();
            this.chat_session = new Chat_session(this.$session, this.session);
            this.chat_session.init();
        },

        _initEvent : function() {
            this.on("tabChange", this.faceChange.bind(this));
            this.on("addsession", this.addSession.bind(this));
            this.on("logout", this.logout.bind(this));
            this.on("message", this.message.bind(this));
            this.on("chatBuild", this.chatBuild.bind(this));
            this.on("chatBuilded", this.chatBuilded.bind(this));
            this.on("chatMsg", this.chatMsg.bind(this));
        },

        faceChange : function(id) {
            console.log(id);
            var el = _.$("section[data-face=" + id + "]", this.el);
            var faces = _.$All('section[data-face]', this.el);
            faces = _.makeArray(faces);

            faces.forEach(function(el) {
                el.classList.remove('face_show');
            });
            el.classList.add('face_show');
        },

        addSession : function(data) {
            console.log(data);
            console.log(this.chat_session);
            console.log(this.chat_session.listeners());

            this.chat_session.emit("addsession", data);
        },

        logout : function() {
            
            this.socket_logout();
        },

        message : function(content) {
            var CO = {
                user : this.user.getUser(),
                content : content
            };
            this.socket_message(CO);
        },

        chatBuild : function(To) {
            var obj = {
                from : this.user.Uid,
                to : To,
                room : this.user.Uid + "to" + To
            };

            this.socket_chatBuild(obj);
        },

        chatBuilded : function(CO) {
            this.socket_chatFrom(CO);
            console.log(CO.from);
            this.chat_member.emit("newMsg", CO.from);
        },

        chatMsg : function(content, id) {
            console.log(this.room);
            var room = this.room[id];
            var CO = {
                from : this.user.Uid,
                room : room,
                to : id
            };

            this.socket_chatMsg(CO, content);
        },

        _initSocket : function() {
            this.socket = io.connect("ws://192.168.1.101:3000");
            this.socket_login(this.socket);

            this.socket.on('login', function(o) {
                if(!this.chat_member) {
                    this._initMember(o);
                    console.log(o);
                    
                }else {
                    this.chat_member.updateOnlineMember("online", o.user.id, o);
                }
            }.bind(this));

            this.socket.on('logout', function(o) {
                console.log(o);
                this.chat_member.updateOnlineMember("offline", o.user.id, o);
            }.bind(this));

            this.socket.on("message", function(CO) {
                console.log(CO);
                var signal = CO.user.name === this.user.getAuthor() ? "my" : "other";
                console.log("signal" + signal);
                this.chat_box.emit("acceptMsg", CO, signal);
            }.bind(this));

            this.socket.on("chatSys", function(CO) {
                var to = CO.to,
                    room = CO.room,
                    from = CO.from,
                    userid = this.user.Uid;
                console.log("userid=" + userid);

                if(to === userid) {
                    this.socket.emit("join", CO);
                    var ioroom = io.connect("ws://192.168.1.101:3000/" + room);
                    console.log(ioroom);
                    this.ioroom[from] = ioroom;
                    this.ioroom[from].on("msg", function(CO, msg) {
                        console.log(CO);
                        console.log(msg);
                        console.log(this.user.Uid);

                        if(CO.from !== this.user.Uid)  {
                            if( this.isOpen[CO.from] === undefined ) {
                                this.isOpen[CO.from] = false;
                            }

                            if(this.isOpen[CO.from]) {
                                CO.box = CO.from;
                                this.chat_member.emit("cmsg", "other", CO, msg);
                            }else {
                                if( !this.msgArr[CO.from] ) {
                                    this.msgArr[CO.from] = [];
                                }
                                this.msgArr[CO.from].push(msg);
                            }
                        }else {
                            console.log("hahahahahah");

                            //CO.box = CO.room.slice(CO.room.indexOf("o") + 1);
                            CO.box = CO.to;
                            this.chat_member.emit("cmsg", "my", CO, msg, this.user.getUser());
                        }

                    }.bind(this));
                    this.emit("chatBuilded", CO);
                }

                
            }.bind(this));
        },

        socket_login : function(socket) {
            var user_name = this.user.getAuthor(),
                user_img = this.user.getImgUrl(),
                user_sign = this.user.getPersonSign(),
                user_id = this.user.Uid = this.getUid();
            socket.emit("login", {name : user_name, img : user_img, sign : user_sign, id : user_id, state:"online"});
        },

        socket_logout : function() {
            this.socket.emit("logout", this.user.Uid);
        },

        socket_message : function(CO) {
            this.socket.emit("message", CO);
        },

        socket_chatBuild : function(obj) {
            if(!this.room) {
                this.room = {};
            }
            if(!this.room[obj.to]) {
                this.room[obj.to] = obj.room;
            }

            this.socket.emit("chatBuild", obj);
            console.log(io);
            var ioroom = io.connect("ws://192.168.1.101:3000/" + obj.room);
            console.log(ioroom);
            this.ioroom[obj.to] = ioroom;

            this.ioroom[obj.to].on('msg', function(CO, msg) {

                if(CO.from === this.user.Uid) {
                    CO.box = CO.room.slice(CO.room.indexOf("o") + 1);
                    console.log(CO.box);
                    this.chat_member.emit("cmsg", "my", CO, msg, this.user.getUser());
                } else {
                    CO.box = CO.from;
                    this.chat_member.emit("cmsg", "other", CO, msg);
                }
                console.log(msg);
            }.bind(this));
        },

        socket_chatFrom : function(CO) {
            if(!this.room) {
                this.room = {};
            }
            if(!this.room[CO.from]) {
                this.room[CO.from] = CO.room;
            }
        },

        socket_chatMsg : function(CO, content) {
            this.ioroom[CO.to].emit('msg', CO, content);
            //this.socket.emit("chatMsg", CO, content);
        },

        getUid : function() {
            return new Date().getTime() + "" + Math.floor(Math.random() * 899 + 100);
        },
    });

    return Chat;
});