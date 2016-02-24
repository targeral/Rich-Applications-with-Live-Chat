define(['util', 'eventemitter', 'app-chat/view/build/template'], function(util, Event, template) {
    var _ = util;

    function Chat_session(el, sessions) {
        this.el = el;
        this.sessions = sessions;
    }

    Chat_session.prototype = {
        elements : {

        }
    };

    Chat_session = _.eventify(Chat_session, Event);

    _.include(Chat_session, {
        init : function() {
            if( this._checkSession() ) {
                this._render();
            } else {
                
                this.el.innerHTML = "无记录";
            }

            this._initDom();
            this._initEvent();
        },

        _render : function() {
            var tpl = this._template();
            
            this.el.innerHTML = tpl;
        },

        _template : function() {
            
            return template("chat-session", this.sessions.getSessionObj());
        },

        _initDom : function() {
            for(var attr in this.elements) {
                this[ this.elements[ attr ] ] = _.$(attr, this.el);
            }
        },

        _initEvent : function() {
            _.delegate(this.el, "section", "click", this.showChat.bind(this), {
                fn : function(target) {
                    return target.classList.contains("session-item");
                }
            });

            this.on("addsession", this.updateSession.bind(this));
        },

        showChat : function(e, t) {
            
            var dataChatName = t.getAttribute("data-sessionname");
            var el = _.$("section[data-chatname='" + dataChatName + "']");
            this._showDiv(el.parentElement);
        },

        _showDiv : function(el) {
            el.classList.remove("mz");
        },

        updateSession : function(session) {
            
            if(this._hasSession(session)) {
                return ;
            }
            this._updateSession(session);
            this._render();
        },

        _hasSession : function(session) {
            return this.sessions.hasSession(session);
        },

        _updateSession : function(session) {
            this.sessions.addSession(session);
        },

        _checkSession : function() {
            if(!this.sessions.getSession()) {
                return false;
            }

            return true;
        }
    });

    return Chat_session;
});