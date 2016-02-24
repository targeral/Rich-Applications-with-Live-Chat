define(['util', 'eventemitter', 'app-chat/view/build/template'], function(util, eventemitter, template) {
    var _ = util;
    var Event = eventemitter;

    function Chat_box(el, message) {
        this.el = el;
        this.message = message;
    }

    Chat_box.prototype = {
        elements : {
            ".chat-box" : "$chatbox",
            ".chat-message" : "$ChatMsgRegion"
        }
    };

    Chat_box = _.eventify(Chat_box, Event);

    _.include(Chat_box, {
        init : function() {
            this._render();
            this._initDom();
            this._initEvent();
        },

        _render : function() {
            var tpl = this._template();
            this.el.innerHTML = tpl;
        },

        _template : function() {
            return template("chat-box", {});
        },

        _initDom : function() {
            for(var attr in this.elements) {
                this[ this.elements[ attr ] ] = _.$(attr, this.el);
            }
        },

        _initEvent : function() {
            _.delegate(this.$chatbox, "textarea", "keyup", this.EnterSendMsg.bind(this));
            _.delegate(this.$chatbox, "button", "click", this.BtnSendMsg.bind(this));
            this.on("acceptMsg", this.addMessage.bind(this));
        },

        EnterSendMsg : function(e) {
            if(e.keyCode === 13 || e.which === 13) {
                this._sendMsg(e.target);
            }
        },

        BtnSendMsg : function(e) {
            var textarea = _.$("textarea", e.target.parentElement);
            this._sendMsg(textarea);
        },

        _sendMsg : function(el) {
            var value = el.value;
            el.value = "";
            this.emit("sendMsg", value);
        },

        addMessage : function(CO, signal) {
            var tplObj = {
                imgUrl : CO.user.image,
                sign : CO.user.sign,
                author : CO.user.name,
                content : CO.content
            };
            var tpl = this._template_msg(signal, tplObj)
            var msg = _.template(tpl, 'msg');
            this.$ChatMsgRegion.appendChild(msg);
        },

        _template_msg : function(signal, obj) {
            if(signal === "my") {
                return template("my-msg", obj);
            }else if(signal === "other") {
                return template("other-msg", obj);
            }
        }
    });

    return Chat_box;
});