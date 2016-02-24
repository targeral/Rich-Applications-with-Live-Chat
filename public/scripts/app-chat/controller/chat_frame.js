define(['util', 'eventemitter', 'app-chat/view/build/template'], function(util, Event, template) {
    var _ = util;

    function Chat_frame(el, user) {
        this.el = el;
        this.user = user;
    }

    Chat_frame.prototype = {
        constructor : Chat_frame,

        elements : {
            ".sign" : "$sign",
            ".chat-msg" : "$chatMsg",
            "input[type=search]" : "$search",
            "nav" : "$nav",
            "#leave" : "$leave"
        }
    }

    Chat_frame = _.eventify(Chat_frame, Event);

    _.include(Chat_frame, {
        init : function() {
            this._render();
            this._initDom();
            this._initEvent();
        },

        _render : function() {
            this._template();
        },

        _template : function() {
            var tpl = template('chat_frame', {
                author : this.user.getAuthor(),
                person_sign : this.user.getPersonSign(),
                image : this.user.getImgUrl()
            });
            this.el.innerHTML = tpl;
        },

        _initDom : function() {
            for(var key in this.elements) {
                this[this.elements[key]] = _.$(key, this.el);
            }
        },

        _initEvent : function() {
            _.delegate(this.$chatMsg, 'p' ,'click', this.edit.bind(this));
            _.delegate(this.$chatMsg, 'input', 'blur', this.edited.bind(this), {userCapture : true});
            _.delegate(this.$chatMsg, 'input', 'keyup', this.edited.bind(this));
            _.on(this.$search, 'keyup', this.search.bind(this));
            _.delegate(this.$nav, 'a', 'click', this.tab.bind(this));
            _.on(this.$leave, "click", this.leave.bind(this));
        },

        edit : function(e) {
            var target = e.target;
            var parent = target.parentElement;
            this._edit(target, parent);
        },

        _edit : function(target, parent) {
            var text = target.textContent;
            var input = document.createElement("input");
            input.className = "sign";
            input.dataset.editable = '';
            input.value = text;

            parent.removeChild(target);
            parent.appendChild(input);
            input.focus();
        },

        edited : function(e) {
            if(e.type === "keyup" && e.keyCode != 13) {
                return ;
            }else if(e.type === "keyup" && e.keyCode == 13) {
                _.$(".sign", this.$chatMsg).blur();
                return;
            }
            var target = e.target;
            var parent = target.parentElement;
            this._edited(target, parent);
        },

        _edited : function(target, parent) {
            var text = target.value;
            var p = document.createElement("p");
            p.className = "sign";
            p.dataset.editable = '';
            p.textContent = text;

            parent.removeChild(target);
            parent.appendChild(p);

            var user = this.user.setUser({
                sign : text
            });
            this._updateUser(user);

        },

        _updateUser : function(user) {

        },

        search : function() {

        },

        tab : function(e) {
            var target = e.target;
            var parent = e.currentTarget;
            var id = target.getAttribute("data-chatid");
            this._tab(target, parent);
            this.emit("tabChange", id);
        },

        _tab : function(target, parent) {
            var as = _.$All("a", parent);
                as = _.makeArray(as);
            as.forEach(function(el) {
                el.classList.remove('active');
            });
            target.classList.add("active");
        },

        leave : function() {
            this.emit("leave");
        }
    });

    return Chat_frame;
});