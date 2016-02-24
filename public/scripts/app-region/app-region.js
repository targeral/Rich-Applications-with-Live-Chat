define(['util', 'app-region/model/App_menu', 'app-region/controller/App_menus', 'app-plug-in/config', 'app-plug-in/plug-in'], function(util, App_menu, App_menus, config, plugin) {
    var _ = util;

    function App_region(el) {
        this.el = _.$(el);
    }

    App_region.prototype = {
        init : function() {
            this._initApp_menu();
            this._initApp_plugin();
        },

        _initApp_menu : function() {
            this.App_menu = new App_menu(_.keys(config));
            this.App_menus = new App_menus(this.App_menu, this.el);
            this.App_menus.init();
            this.App_menus.on("openApp", function(id) {
                this.App_plugin.open(id);
                this.App_menus.emit("disappear");
            }.bind(this));
        },

        _initApp_plugin : function() {
            this.App_plugin = new plugin(config, this.el);
            this.App_plugin.init();
            this.App_plugin.on("close", function() {
                this.App_menus.emit("show");
            }.bind(this));
        }
    };

    return App_region;
});