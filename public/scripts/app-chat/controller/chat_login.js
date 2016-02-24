define(['util', 'eventemitter', 'app-chat/view/build/template'], function(util, Event, template) {
    var _ = util;

    function Chat_login(el, login) {
        this.el = el;
        this.login = login;
    }

    Chat_login.prototype = {
        data : null,
        loginStatus : "",

        elements : {
            ".login-btn" : "$login",
            ".regist-btn" : "$regist",
            "input[type=text]" : "$account",
            "input[placeholder=sign]" : "$sign",
            "input[type=checkbox]" : "$checkbox"
        }
    };

    Chat_login = _.eventify(Chat_login, Event);

    _.include(Chat_login, {
        getEl : function() {
            return this.el;
        },

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
            return template("chat-login", {});
        },

        _initDom : function() {
            for(var attr in this.elements) {
                this[ this.elements[attr] ] = _.$(attr, this.el);
            }
        },

        _initEvent : function() {
            _.on(this.$login, "click", this.log.bind(this));
        },

        log : function(e) {
            e.preventDefault();
            var data = this._getLoginData();
            if(!data.account) {
                this.$account.classList.add("wrong");
                return ;
            }
            this.$account.classList.remove("wrong");
            this.emit("log", data);

        },

        _getLoginData : function() {
            var account = this.$account.value,
                sign = this.$sign.value,
                sex,
                sexs = _.$All("input[type=radio]");
                for(var i = 0, il = sexs.length; i < il; i++) {
                    if(sexs[i].checked) {
                        sex = sexs[i].value;
                    }
                }

                if(account === "") {
                    return false;
                }

            return {
                account : account,
                sign : sign,
                sex : sex
            };
        },

        _checkAccount : function(formdata) {
            var success = this._loginSuccess.bind(this),
                fail = this._loginFail.bind(this);

            _.ajax("POST", "http://localhost:3000/login", formdata, {
                success : success,
                fail : fail
            });
        },

        _loginSuccess : function(data) {
            this.data = data;
            this.loginStatus = true;
        },

        _loginFail : function(msg) {
            this.loginStatus = false;
        },

        regist : function() {

        }
    });

    return Chat_login;
});