define(['util'], function(util) {
    var _ = util;

    function Session( lists ) {
        this.sessionList = lists || [];
        /*
        {
            imgUrl : imgUrl,
            name : name,
            sign : sign
        }
         */
    }


    Session.prototype = {
        addSession : function(s) {
            if( _.isArray( this.sessionList ) ) 
                this.sessionList.push(s);
        },

        removeSession : function( index ) {
            if( _.isArray( this.sessionList ) ) {
                this.sessionList = this.sessionList.splice(index, 1);
            }
        },

        removeAllSession : function() {
            this.sessionList = [];
        },

        getSession : function() {
            if(this.sessionList && this.sessionList.length === 0) {
                return false;
            }

            return this.sessionList;
        },

        hasSession : function(list) {
            for(var i = 0, len = this.sessionList.length; i < len; i++) {
                if( this.sessionList[i].name === list.name) {
                    return true;
                }
            }
            return false;
        },

        getSessionObj : function() {
            return {
                list : this.sessionList
            };
        }
    };

    return Session;
});