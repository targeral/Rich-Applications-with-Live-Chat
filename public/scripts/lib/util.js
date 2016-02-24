define(function() {
    var util = {
        isFunction : function(func) {
            return Object.prototype.toString.call(func) === '[object Function]';
        },

        isArray : function(arr) {
            return Object.prototype.toString.call(arr) === '[object Array]';
        },

        isUndefined : function(args) {
            return Object.prototype.toString.call(args) === '[object Undefined]';
        },

        makeArray : function(arr) {
            if(arguments.length > 1) {
                return Array.prototype.slice.call(arguments);
            }
            return Array.prototype.slice.call(arr, 0);
        },

        slice : function(arr) {
            var args = this.makeArray(arguments).slice(1);
            var result = arr.slice(args);

            return result;
        },

        extend : function(obj1, obj2) {
            for(var key in obj2) {
                if( !!obj1[ key ] ) continue;
                obj1[ key ] = obj2[ key ];
            }
        },

        include : function(obj1, obj2) {
            for(var key in obj2) {
                if( !!obj1.prototype[ key ] ) continue;
                obj1.prototype[key] = obj2[key];
            }
        },

        eventify : function(klass, event) {
            var EventEmitter = event;

            if(klass.prototype instanceof EventEmitter) {
                console.warn("Class has been eventified");
                return klass;
            }

            function newClass() {
                klass.apply(this, arguments);
                EventEmitter.call(this);
            }

            function F() {}

            F.prototype = this.createObject(EventEmitter.prototype);
            F.prototype.constructor = EventEmitter;

            var newClassProp = this.createObject(F.prototype);
            var klassProp = klass.prototype;

            for(var attr in klassProp) {
                newClassProp[attr] = klassProp[attr];
            }

            newClass.prototype = newClassProp;
            newClass.prototype.constructor = klass;

            return newClass;
        },

        createObject : function(obj) {
            if( !!Object.create ) {
                this.createObject = Object.create;
            }
            else {
                this.createObject = function(obj) {
                    var F = function() {};
                    F.prototype = obj;
                    F.prototype.constructor = F;//??
                    return new F();
                };
            }

            return this.createObject(obj);
        },

        $ : function(selector, scope) {
            var s = selector.trim(),
                d = scope || document,
                dom;

            if(s.charAt(0) === "#" && s.indexOf(" ") == -1 && d.getElementById) {
                dom = d.getElementById(selector.slice(1));
            } else {
                dom = d.querySelector(selector);
            }

            return dom;
        },

        $All : function(selector, scope) {
            var d = scope || document;
            var dom = d.querySelectorAll(selector);
            return dom;
        },

        proxy : function(func, that) {
            return func.bind(that);
        },

        on : function(parent, type, callback, useCapture) {
            parent.addEventListener(type, callback, useCapture || false);
        },

        delegate : function(parent, target, type, callback, obj) {
            var obj = obj || {};
            
            parent.addEventListener(type, function(e) {
                var t = e.target,
                    current = e.currentTarget;
                
                while(t && current !== t) {

                    if(t && t.tagName === target.toUpperCase() && (obj.fn ? obj.fn(t) : true) ) {
                        callback(e, t);
                    }
                    t = t.parentElement;
                }
            }, obj.useCapture || false);
        },

        htmlToDom : function(tpl, dom) {
            var fragment = document.createDocumentFragment();
            var div = document.createElement('div');
            div.innerHTML = tpl;
            fragment.appendChild(div);
            dom.appendChild(fragment);
        },

        template : function(str, dom) {
            var fragment = document.createDocumentFragment();
            dom = dom || "div";
            var elem = document.createElement(dom);
            elem.innerHTML = str;
            fragment.appendChild(elem);

            return fragment;
        },

        getCss : function(el, key) {
            return window.getComputedStyle ? window.getComputedStyle(el)[key] : el.currentStyle[key];
        },

        getWindow : function() {
            var height = document.documentElement.clientHeight || document.body.clientHeight;
            var width = document.documentElement.clientWidth || document.body.clientWidth;

            return {
                height : height,
                width : width
            };
        },

        drag : function(dragwhat, target, callback) {
            var params = {
                left : 0,
                top : 0,
                offsetLeft : 0,
                offsetTop : 0,
                currentX : 0,
                currentY : 0,
                flag : false
            };

            var onMoveStartId;

            

            if(this.getCss(dragwhat, "left") != "auto") {
                params.left = this.getCss(dragwhat, "left");
            }
            if(this.getCss(dragwhat, "top") != "auto") {
                params.top = this.getCss(dragwhat, "top");
            }

            this.on(target, "mousedown", function(event) {
                params.flag = true;

                var e = event;
                params.offsetLeft = e.pageX - this.offsetLeft;
                params.offsetTop = e.pageY - this.offsetTop;

                onMoveStartId = setInterval(onMoveStart, 10);
                return false;
            }.bind(dragwhat));

            function onMoveStart() {
                if(params.flag) {
                    var maxX = document.documentElement.clientWidth - dragwhat.offsetWidth;
                    var maxY = document.documentElement.clientHeight - dragwhat.offsetHeight;

                    dragwhat.style.left = Math.min( Math.max( (params.x - params.offsetLeft ), 0), maxX ) + "px";
                    dragwhat.style.top = Math.min( Math.max( (params.y - params.offsetTop ), 0), maxY) + "px";
                }
            }

            this.on(document, "mouseup", function() {
                params.flag = false;
                
                clearInterval(onMoveStartId);
                /*if(this.getCss(dragwhat, "left") != "auto") {
                    params.left = this.getCss(dragwhat, "left");
                }
                if(this.getCss(dragwhat, "top") != "auto") {
                    params.top = this.getCss(dragwhat, "top");
                }*/
            }.bind(this));

            this.on(document, "mousemove", function(event) {
                var e = event ? event : window.event;

                if(params.flag) {
                   params.x = e.clientX;
                   params.y = e.clientY;

                   e.stopPropagation && e.stopPropagation();
                   e.cancelBubble = true;
                   e = this.originalEvent;
                   e && ( e.preventDefault ? e.preventDefault() : e.returnValue = false );

                   document.body.style.MozUserSelect = 'none';
                }

                if(this.isFunction(callback)) {
                    callback(parseInt(params.left) + disX, parseInt(params.top) + disY);
                }
            }.bind(this));
        },

        DomforEach : function(doms, fn, obj) {
            var doms = this.makeArray(doms);

            doms.forEach(function(el){
                fn.apply(this, arguments);
            }, obj);
        },

        ajax : function(method, url, data, fn, timeout) {
            var xhr = new XMLHttpRequest();

            fn = fn || {};
            fn.success = fn.success || function(){},
            fn.fail = fn.fail || function() {},
            fn.timeout = fn.timeout || function() {};

            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4) {
                    try{
                        
                        if(xhr.status < 300 || xhr.status >= 200 || xhr.status === 304) {
                            
                            fn.success(xhr.response);
                        }else {
                            fn.fail(xhr.statusText);
                        }
                    }catch(ex) {
                        fn.timeout();
                    }
                }
            };

            xhr.onerror = function(e) {
                console.error(xhr.statusText);
            };

            xhr.ontimeout = fn.timeout;


            xhr.open(method, url, true);
            xhr.timeout = timeout || 10000;
            if(method.toUpperCase() === "GET") {
                xhr.send();
            }else if(method.toUpperCase() === "POST") {
                //xhr2
                
                if(data instanceof FormData) {
                    
                    xhr.send(data);
                }else {
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    
                    xhr.send("data=" + JSON.stringify(data));
                }
            }
        },

        keys : function(o) {
            return Object.keys(o);
        },

        insertHTML : function(_aoDomObj, _asWhere, _asHtml) {
            if (!_aoDomObj) {
                return false;
            }
            try {
            // err ex: textarea afterBegin ... ( can not insert ... )
            if (_aoDomObj.insertAdjacentHTML) {
                _aoDomObj.insertAdjacentHTML(_asWhere, _asHtml);
            } else {
                var _oRange = _aoDomObj.ownerDocument.createRange(),
                _abIsBefore = _asWhere.indexOf("before") == 0,
                _abIsBegin = _asWhere.indexOf("Begin") != -1;
                if (_abIsBefore == _abIsBegin) {
                    _oRange[_abIsBefore ? "setStartBefore" : "setStartAfter"](_aoDomObj);
                    _aoDomObj.parentNode.insertBefore(
                        _oRange.createContextualFragment(_asHtml), _abIsBegin ? _aoDomObj : _aoDomObj.nextSibling
                        );
                } else {
                    var _oDomObj = _aoDomObj[_abIsBefore ? "lastChild" : "firstChild"];
                    if (_oDomObj) {
                        _oRange[_abIsBefore ? "setStartAfter" : "setStartBefore"](_oDomObj);
                        _aoDomObj[_abIsBefore ? "appendChild" : "insertBefore"](_oRange
                            .createContextualFragment(_asHtml), _oDomObj);
                    } else {

                        _aoDomObj.innerHTML = _asHtml;
                    }
                }
            }
                return true;
            } catch (_oError) {
                //debug(_oError.message)
                return false;
            }
        },

        random : function(start, num) {
            start = start || 0;
            var random = Math.floor(Math.random() * num + start);
            return random;
        }
    };

    return util;
});