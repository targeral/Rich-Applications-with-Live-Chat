define(['util', 'eventemitter', 'app-region/view/build/template'], function(util, Event, template) {
    var _ = util;

    function App_menus( applist, el ) {
        this.applist = applist;
        this.el = el;
    }

    App_menus.prototype = {
        contructor : App_menus,

        elements : {
            "$applist" : "#myapplist",
            "$openAppList" : ".openAppList"
        }
    };

    App_menus = _.eventify(App_menus, Event);

    _.include(App_menus, {

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
            return template('app_menu', this.applist.getList() );
        },


        _initDom : function() {
            for(var key in this.elements) {
                this[ key ] = _.$( this.elements[ key ] );
            }
        },

        _initEvent : function() {
            _.delegate( this.$applist, "a", 'click', this.openApp.bind(this));
            _.on( this.$openAppList, 'click', this.openAppList.bind(this));
            this.on('disappear', this.disappear.bind(this));
            this.on('show', this.show.bind(this));
        },

        openApp : function(e) {
            e.preventDefault();

            if( !e.target.getAttribute("data-applist")) {
                return false;
            }

            var applistId = e.target.getAttribute( "data-applist" );
            this._openApp(applistId);
        },

        _openApp : function(id) {
            this.emit("openApp", id);
        },

        openAppList : function(e) {
            e.preventDefault();
            this._openAppList();
        },

        _openAppList : function() {
            this.emit("openAppList");
            alert("open App List");
        },

        disappear : function() {
            this.$applist.classList.add("close");
        },

        show : function() {
            this.$applist.classList.remove("close");
        }
    });

    return App_menus;
});