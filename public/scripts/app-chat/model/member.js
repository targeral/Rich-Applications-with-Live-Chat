define(['util'], function(util) {
    var _ = util;

    function Member(lists, onlineCount, totalCount) {
        this.lists = lists || {};
        this.totalCount = totalCount || onlineCount || 0;
        this.onlineCount = onlineCount || 0;
    }

    Member.prototype = {
        initMember : function() {

        },

        getMember : function() {
            var lists = this._getList();
            var TotalCount = this._getTotalCount();
            var OnlineCount = this._getOnlineCount();
            return {
                lists : lists,
                totalCount : TotalCount,
                onlineCount : OnlineCount
            };
        },

        hasMember : function() {
            if(this.totalCount === 0) {
                return false;
            }
            return true;
        },

        updateMember : function(lists) {
            this.lists = lists;
            this.totalCount = Object.keys(lists).length;
        },

        addMember : function(list) {
            this._addList(list);
            this._addTotalCount();
        },

        descMember : function(list) {
            this._descList(list);
            this._descTotalCount();
        },

        addOnlineCount : function() {
            this.onlineCount ++;
        },

        descOnlineCount : function() {
            this.onlineCount --;
        },

        changeState : function(list) {
            var position = this._findList(list);
            this.lists[position].state = this.lists[position].state === "online" ? "offline" : "online";
        },

        _getList : function() {
            return this.lists;
        },

        _getTotalCount : function() {
            return this.totalCount;
        },

        _getOnlineCount : function() {
            return this.onlineCount;
        },

        _addList : function(list) {
            for(var key in list) {
                if(this.lists[key]) continue;
                this.lists[key] = list[key];
            }
        },

        _addTotalCount : function() {
            this.totalCount ++;
        },

        _descList : function(list) {
            var position = this._findList(list);

            delete this.lists[position];
        },

        _findList : function(list) {
            var position;
            for(var key in this.lists) {
                if(this.lists.hasOwnProperty(key)) {
                    if(this.lists[key].id === list.id) {
                        position = key;
                        break;
                    }
                }
            }
            return position;
        },

        _descTotalCount : function() {
            this.totalCount --;
        }
    };

    return Member;
});