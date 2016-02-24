define(['require', 'util', 'eventemitter'], function(require, util, eventemitter) {
    var _ = util;
    var Event = eventemitter;

    function App_plugin(config, el) {
        this.config = config;
        this.el = el;
        this.applist = {};
        this.isOpen = false;
        this.openApp = null;
    }

    App_plugin.prototype = {};

    App_plugin = _.eventify(App_plugin, Event);

    _.include(App_plugin, { 
        init : function() {
            var app;
            for(var key in this.config) {
                app = this.config[key];
                if(!this.applist[key]) {
                    this.applist[key] = new app(this.el);
                }
            }

            this._initEvent();
        },

        _initEvent : function() {
            this.on("close", this.close.bind(this));
        },

        open : function(key) {
            this.applist[key].init();

            this.openApp = this.applist[key];
            this.isOpen = true;

            this.openApp.on('close', function() {
                this.emit("close");
            }.bind(this));
        },

        close : function() {
            this.openApp = null;
            this.isOpen = false;
        }
    });

    return App_plugin;
});