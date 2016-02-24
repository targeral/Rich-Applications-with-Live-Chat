define(['util', 'eventemitter', 'app-chat/view/build/template'], function(util, Event, template) {
    var _ = util;

    function Chat_member(el, member) {
        this.member = member;
        this.el = el;
        this.removeEvent = [];
        this.new = "";
        //this.onlineId = onlineid;
    }

    Chat_member.prototype = {
        elements : {
            "section[data-list]" : "$dataList",
            "section.online-items" : "$onlineItems"
        }
    };

    Chat_member = _.eventify(Chat_member, Event);

    _.include(Chat_member, {
        init : function() {
            this._render();
            this._initDom();
            //this.updateOnlineMember(this.onlineId);
            this._initEvent();
        },

        _render : function() {
            var tpl = this._template();   
            this.el.innerHTML = tpl;
        },

        _template : function() {
            var data = this.member.getMember();

            return template('chat_member', data);
        },

        _initDom : function() {
            for(var attr in this.elements) {
                this[this.elements[attr]] = _.$(attr, this.el);
            }
            this.$mask = _.$("#mask");
        },

        _initEvent : function() {
            var openChat = this.OpenChat.bind(this);
            this._addremoveEvent({el : this.$dataList, type : 'click', event : openChat, b : false});


            _.delegate(this.$dataList, "section", 'click', openChat, {fn : function(target) {
                var b = target.classList.contains("online-item");
            
                return b;
            }, useCapture : true});
            
            this.on('newMsg', this.newMsg.bind(this));
        },

        _addremoveEvent : function(event) {
            this.removeEvent.push(event);
        },

        _removeEvent : function() {
            var e = this.removeEvent;
            for(var i = 0, il = e.length; i < il; i++) {
                e[i].el.addEventListener(e[i].type, e[i].event, e[i].b);
            }
        },

        updateOnlineMember : function(line, id, o) {

            this.datalistId = this.datalistId || [];
            o = o || {};

            if( _.isUndefined(id) ) {
                return ;
            }
            this._updateDom(line, id, o);
        },

        _updateDom : function(line, id, o) {
            var exist = this.datalistId.indexOf(id);
        
            if(exist === -1) {
                this.datalistId.push(id);
                this._updateMember(line, o);
                this._removeEvent();
                this._render();
                this._initDom();
                this._initEvent();
                this._moveDom(line, id);
            }else {
                this._updateMember(line, o);
                _.$(".count", this.el).innerHTML = o.onlineCount;
                this._moveDom(line, id);
            }
        },

        _updateMember : function(line, o) {
            if(line === "online") {
                o.state = line;
                this.member.updateMember(o.onlineUsers);
                this.member.addOnlineCount();
            }else if(line === "offline") {
                this.member.changeState(o.user);
                this.member.descOnlineCount();
            }
        },

         _moveDom : function(line, id) {
            var dom = _.$("[data-listId='" + id + "']");
    
            if(line === "online") {
                this.$dataList.insertBefore(dom, this.$dataList.firstElementChild);
            }else if(line ==="offline") {
                dom.classList.remove("online");
                dom.classList.add("offline");
                this.$dataList.appendChild(dom);
            }
        },

        OpenChat : function(e, t) {
            var data = this._OpenChat_data(t);

            if( this._OpenChat_check(data) ) {
                return false;
            }
            this._OpenChat_render(data);
            this._OpenChat_initDom();
            this._OpenChat_event(data);
            this.emit("chatBuild" + this.new, data.id);
            this.new = "";
        },

        _OpenChat_data : function(el) {
            return {
                name : _.$("h2", el).innerHTML,
                imgUrl : _.$("img", el).src,
                sign : _.$(".online-user > p").innerHTML,
                id : el.getAttribute("data-listid")
            };
        },

        _OpenChat_check : function(data) {
            
            if( !!_.$("section[data-chatname='" + data.name + "']") ) {
                return true;
            }
            return false;
        },

        _OpenChat_render : function(data) {
            if(!this.$mask.classList.contains("show")) {
                this.$mask.classList.add("show");
            }
            this.$maskChat = document.createElement("div");
            this.$maskChat.className = "mask-chat";
            this.$maskChat.setAttribute("data-chatId", data.id);
            var tpl = template('chat-box', {chatname : data.name});
            this.$maskChat.innerHTML = tpl;
            this.$mask.appendChild(this.$maskChat);
        }, 

        _OpenChat_initDom : function() {
            this.$close = _.$(".close", this.$mask);
            this.$minimize = _.$(".minimize", this.$mask);
            this.$textarea = _.$("textarea", this.$mask);
            this.$btn = _.$(".msg_send");
            this.$chatfn = _.$All(".chat-fn", this.$mask);
        },

        _OpenChat_event : function(data) {
            _.delegate(this.$maskChat, "span", "click", this.closeChat.bind(this), {
                fn : function(target) {
                    return target.innerHTML === "X";
                }
            });
            _.delegate(this.$maskChat, "span", "click", this.minimizeChat.bind(this, data), {
                fn : function(target) {
                    return target.innerHTML === "_";
                }
            });

            _.delegate(this.$maskChat, "textarea", "keyup", this.EnterSendMsg.bind(this, data));
            _.delegate(this.$maskChat, "button", "click", this.BtnSendMsg.bind(this, data));

            _.DomforEach(this.$chatfn, function(el){
                
                _.drag(this.$maskChat, el);
            }, this);

            this.on('showChat', this.ShowChat.bind(this));
            this.on('cmsg', this.addMsg.bind(this));
        },

        ShowChat : function(data) {
            var parent = _.$("section[data-chatname='" + data.name + "']", this.$mask).parentElement;
            parent.classList.remove("mz");
        },

        closeChat : function(e) {
            this._removeChat(e.currentTarget);
            this._disconnectChat();
        },

        _removeChat : function(el) {
            el.parentElement.removeChild(el);
            if(this.$mask.childElementCount === 0) {
                this.$mask.classList.remove("show");
            }
        },

        _disconnectChat : function() {
            alert("disconnect!");
        },

        minimizeChat : function(data, e) {
            this._hiddenChat(e.currentTarget);
            this._emitAddSession(data);
        },

        _hiddenChat : function(el) {
            el.classList.add("mz"); 
        },

        _emitAddSession : function(data) {
            this.emit("addsession", data);
        },

        EnterSendMsg : function(data, e) {
            if(e.keyCode === 13 || e.which === 13) {
                this._sendMsg(e.target, data.id);
            }
        },

        BtnSendMsg : function(data, e) {
            var textarea = _.$("textarea", e.target.parentElement);
            this._sendMsg(textarea, data.id);
        },

        _sendMsg : function(el, id) {
            var value = el.value;
            el.value = "";
            this.emit("chatMsg", value, id);
        },

        addMsg : function(who, CO, msg, user) {
            var el = _.$("section[data-listId='" + CO.from + "']");
            user = user || {img : _.$("img", el).src , name : _.$("h2", el).innerHTML, sign : _.$("p", el).innerHTML};

            var chat = _.$("div[data-chatId='" + CO.box + "']"),
                article = _.$(".chat-message", chat);

            var tpl = this._MsgTpl(who, msg, user);
            var msg = _.template(tpl, 'msg');
            article.appendChild(msg);
            
        },

        _MsgTpl : function(who, msg, user) {
            if(who === "my") {
                return template("my-msg", {
                    imgUrl : user.image,
                    content : msg
                });
            }else if(who === "other") {
                return template("other-msg", {
                    imgUrl : user.img,
                    sign : user.sign,
                    author : user.name,
                    content : msg
                });
            }
        },

        newMsg : function(id) {
            var section = _.$("section[data-listid='" + id + "']", this.el);
            var newMsg = _.$("span.nothingMsg", section);
            newMsg.classList.remove("nothingMsg");
            newMsg.classList.add("newMsg");

            this.new = "ed";
        }
    });

    return Chat_member;
});