define([ 'util' ], function( util ) {
    var _ = util;
    function EventEmitter() {
        this._events = this._events = {};   
    }

    EventEmitter.fn = EventEmitter.prototype = {
        constructor : EventEmitter,

        emit : function( type ) {
            var ev = type,
                events = this._events,
                handler = this._events[ type ],
                handlerIsArray = _.isArray( handler ),
                handlerIsFunction = _.isFunction( handler ),
                handlerIsUndefined = _.isUndefined( handler ),
                args = _.slice( _.makeArray( arguments ), 1 );
                
            if( handlerIsUndefined ) {
                return false;
            }

            if( handlerIsFunction ) {
                handler.apply(this, args);
            }

            if( handlerIsArray ) {
                var i, l;
                if( !events ) return false;
                if( !handler ) return false;

                for(i = 0, l = handler.length; i < l; i++) {
                    if( handler[ i ].apply( this, args) === false )
                        return false;
                }
            }

            return true;
        },

        addListener : function( type, listener ) {
            var events = this._events || ( this._events = {} ),
                eveObj = this._events[ type ],
                eveObjIsUndefined = util.isUndefined( eveObj ),
                eveObjIsFunction = util.isFunction( eveObj ),
                eveObjIsArray = util.isArray( eveObj ),
                listenerIsFunction = util.isFunction( listener );


            if( !listenerIsFunction ) {
                throw TypeError( 'listener must be a function' );
            }

            if( eveObjIsUndefined ) {
                this._events[ type ] = listener;
            }

            if( eveObjIsFunction ) {
                this._events[ type ] = [ eveObj, listener ];
            }

            if( eveObjIsArray ) {
                this._events[ type ].push( listener );
            }
            return this;
        },

        once : function( type, listener ) {
            var listenerIsFunction = util.isFunction( listener );

            if( !listenerIsFunction ) {
                throw TypeError( 'listener must be function');
            }

            var fired = false;

            function middle() {
                this.removeListener( type, middle );

                if(!fired) {
                    fired = true;
                    listener.apply( this, arguments );
                }
            }

            middle.listener = listener;//?
            this.on(type, middle);

            return this;
        },

        removeListener : function(type, listener) {
            var events = this._events || ( this._events = {} ),
                eveObj = events[ type ],
                eveObjIsUndefined  = util.isUndefined( eveObj ),
                eveObjIsFunction   = util.isFunction( eveObj ),
                eveObjIsArray      = util.isArray( eveObj ),
                listenerIsFunction = util.isFunction( eveObj ),
                i, l;

            if( listenerIsFunction ) {
                throw TypeError( 'listener must be a function' );
            }

            if( !events || eveObjIsUndefined) return this;

            if( eveObjIsFunction || ( util.isFunction( eveObj.listener ) && eveObj.listener === listener ) ) {        
                delete this._events[ type ];

                if( this._events.removeListener ) {
                    this.emit( 'removeListener', type, listener );
                }
            }else if( eveObjIsArray ) {
                i = 0, len = eveObj.length; 

                if( len === 1 ) {
                    eveObj.length = 0;
                    delete this._events[ type ];
                }

                for( i = 0, len = eveObj.length; i < len; i++ ) {
                    if( eveObj[i] === listener || ( eveObj[i].listener && eveObj[i].listener === listener ) ) {
                        eveObj[i].splice(i, 1);
                        break;
                    }
                }

                if( i == len ) {
                    return this;
                }

                if( this._events.removeListener ) {
                    this.emit( 'removeListener', type, listener );
                }
            }

            return this;
        },

        removeAllListeners : function(type) {
            var key, listener;

            if( !this._events )
                return this;

            if( !this._events.removeListener ) {
                if( arguments.length === 0 ) {
                    this._events = {};
                } else if(this._events[ type ]) {
                    delete this._events[ type ];
                }

                return this;
            }

            if( arguments.length === 0 ) {
                for( key in this._events ) {
                    if( key === 'removeListener' ) continue;
                    this.removeAllListeners( key );
                }

                this.removeAllListener( 'removeListener' );
                this._events = {};
                return this;
            }

            listeners = this._events[type];

            if( util.isFunction( listeners ) ) {
                this.removeListener( type, listeners );
            } else if( listeners) {
                while(listeners.length) {
                    this.removeListener( type, listeners[listener.length - 1]);
                }
                //delete this._events[type];???
            }
            delete this._events[type];

            return this;
        },

        listeners : function( type ) {
            var result;
            if( !this._events || !this._events[ type ] ) 
                result = [];
            else if( util.isFunction( this._events[type] ) ) {
                result = [ this._events[type] ];
            } else {
                result = this._events[type].slice();//?
            }

            return result;
        }
    };

    EventEmitter.fn.on = EventEmitter.prototype.addListener;

    return EventEmitter;
});