define(['util', 'eventemitter', 'app-plug-in/TodoList/view/build/template',
        'app-plug-in/TodoList/model/model',
        'app-plug-in/TodoList/controller/todos',
        'app-plug-in/TodoList/controller/input_contro',
        'app-plug-in/TodoList/controller/list_contro'], 
        function(util, Event, template, Model, Todos, InputContro, ListContro) {

    var _ = util;

    function TodoList(el) {
        this.el = el;
        this.model = new Model();
        this.todos = new Todos(this.model);
    }

    TodoList.prototype = {
        constructor : TodoList,

        elements : {
            "$close" : ".close",
            "$todolist" : "todolist"
        },

        init : function() {
            var dom = this._initTodoList();
            this._initInput(dom);
            this._initList(dom);
            this.el.appendChild(dom);
            this._initDom();
            this._initEvent();
        },

        _initTodoList : function() {
            var tpl = template('todolist_view', {});
            
            var elem = _.template(tpl, 'todolist');
            return elem;
        },

        _initInput : function(dom) {
            var header = _.$("#todoapp-header", dom);

            var inputView = new InputContro(this.todos, this.model, header);

            inputView.init();
        },

        _initList : function(dom) {
            var list = _.$("#todo-list", dom);

            var listView = new ListContro(this.todos, this.model, list);

            listView.init();
        },

        _initDom : function() {
            for(var key in this.elements) {
                this[key] = _.$(this.elements[key], this.el);
            }
        },

        _initEvent : function() {
            _.on(this.$close, 'click', this.close.bind(this));
        },

        close : function() {
            this.$todolist.classList.add("close");
            this.$todolist.parentNode.removeChild(this.$todolist);
            this.emit("close");
        }
    };

    TodoList = _.eventify(TodoList, Event);

    return TodoList;
});