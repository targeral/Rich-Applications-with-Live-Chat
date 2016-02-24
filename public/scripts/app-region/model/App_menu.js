define(['util'], function(util) {
    var _ = util;

    function App_menu(lists) {
        this.lists = lists || [];
    }

    App_menu.prototype = {
        constructor : App_menu,
    };

    _.include(App_menu, {

        addlist : function( str ) {
            this.list.push( str );
        },

        getList : function() {
            var i, l,
                data = {};
            data['list'] = [];

            for( i = 0, l = this.lists.length; i < l; i++ ) {
                data['list'].push( this._get( i ) );
            }

            return data;
        },

        _get : function( index ) {
            return this.lists[ index ];
        },
    });

    return App_menu;
});