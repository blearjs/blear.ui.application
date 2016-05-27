/**
 * 视图
 * @author ydr.me
 * @create 2016-05-05 19:07
 */



'use strict';

var UI = require('blear.ui');
var modification = require('blear.core.modification');
var selector = require('blear.core.selector');
var layout = require('blear.core.layout');
var morphDom = require('blear.shims.morphdom');
var fun = require('blear.utils.function');
var time = require('blear.utils.time');


var htmlView = require('./view.html', 'html');


var namespace = UI.UI_CLASS + '-application';
var viewId = 0;
var win = window;
var doc = win.document;
var docTitle = doc.title;
var FAVICON = '/favicon.ico?';


var View = UI.extend({
    class: 'View',
    constructor: function (app, options, route) {
        var the = this;
        var viewEl = modification.parse(htmlView);
        var styleEl = modification.create('style');
        var viewsEl = app.getViewsElement();

        View.parent(the);
        the.app = app;
        the.options = options;
        the.route = route;
        the.route.view = the;
        the.controller = route.controller;
        the.id = route.id;
        viewEl.id = namespace + '-' + route.id + '-' + (viewId++);
        styleEl.id = namespace + '-' + route.id + '-' + (viewId++);
        the.viewEl = modification.insert(viewEl, viewsEl);
        the.el = selector.children(viewEl)[0];
        the.styleEl = modification.insert(styleEl, viewsEl);
        the.visible = false;
        the.decorated = false;
        the.destroyed = false;
        the.state = {
            scrollTop: 0
        };

    },


    /**
     * 注入结构
     * @param html
     */
    html: function (html) {
        var the = this;

        if (the.destroyed) {
            return;
        }

        morphDom(the.el, '<div>' + html + '</div>', {
            childrenOnly: true
        });

        return the;
    },

    /**
     * 注入样式
     * @param style
     */
    style: function (style) {
        var the = this;

        if (the.decorated || the.destroyed) {
            return;
        }

        the.decorated = true;
        modification.importStyle(style, the.styleEl);
        return the;
    },


    /**
     * 修改文档标题
     * @param title
     * @returns {View}
     */
    title: function (title) {
        doc.title = title || docTitle;
        var faviconIframe = modification.create('iframe', {
            style: {
                display: 'none'
            },
            src: FAVICON
        });
        faviconIframe.onload = function () {
            time.nextTick(function () {
                modification.remove(faviconIframe);
            });
        };
        modification.insert(faviconIframe);
        return this;
    },


    /**
     * 进入视图
     * @param route
     * @param next
     */
    _enter: function (route, next) {
        var the = this;
        var controller = the.controller;

        the.route = route;
        the.route.view = the;
        next = fun.noop(next);
        var callback = function (boolean) {
            next(boolean);
            the.title(controller.title);
        };

        if (the.destroyed) {
            return callback(true);
        }

        var enter = fun.noop(controller.enter);

        // async enter
        // enter(app, route, next);
        if (enter.length === 3) {
            enter(the, route, callback);
        }
        // sync enter
        // enter(app, route);
        else {
            enter(the, route);
            callback(true);
        }

        return the;
    },


    /**
     * 更新视图
     * @param route
     * @param next
     */
    _update: function (route, next) {
        var the = this;
        var controller = the.controller;

        the.route = route;
        the.route.view = the;
        next = fun.noop(next);

        if (the.destroyed) {
            return next(true);
        }

        var callback = function (boolean) {
            next(boolean);
            the.title(controller.title);
        };

        var update = fun.noop(controller.update);

        // async update
        // update(app, route, next);
        if (update.length === 3) {
            update(the, route, callback);
        }
        // sync update
        // update(app, route);
        else {
            update(the, route);
            callback(true);
        }
    },


    /**
     * 视图离开
     * @param route
     * @param callback
     */
    _leave: function (route, callback) {
        var the = this;
        var controller = the.controller;

        the.route = route;
        the.route.view = the;
        callback = fun.noop(callback);

        if (!the.visible || the.destroyed) {
            return callback(true);
        }

        var next = function next(can) {
            // 当前 view 拒绝离开
            if (!can) {
                return callback(can);
            }

            the.state.scrollTop = layout.scrollTop(win);
            callback(can);
        };
        var leave = fun.noop(controller.leave);

        // async leave
        // leave(app, route, next);
        if (leave.length === 3) {
            leave(the, route, next);
        }
        // sync leave
        // leave(app, route);
        else {
            leave(the, route);
            next(true);
        }
    },


    /**
     * 视图显示
     */
    _show: function (callback) {
        var the = this;
        var options = the.options;
        callback = fun.noop(callback);

        if (the.destroyed || the.visible) {
            return callback(true);
        }

        var viewOptions = the[_getViewOptions](true);
        the.visible = true;
        options.showAnimation(the.viewEl, viewOptions, function () {
            time.nextFrame(function () {
                layout.scrollTop(win, the.state.scrollTop);
            });
            callback(true);
        });
    },


    /**
     * 视图隐藏
     */
    _hide: function (callback) {
        var the = this;
        var options = the.options;
        callback = fun.noop(callback);

        if (!the.visible || the.destroyed) {
            return callback(true);
        }

        var viewOptions = the[_getViewOptions](false);
        the.visible = false;
        the.state.scrollTop = the.viewEl.scrollTop;
        options.hideAnimation(the.viewEl, viewOptions, function () {
            callback(true);
        });
    },


    /**
     * 视图销毁
     */
    _destroy: function () {
        var the = this;
        var controller = the.controller;

        if (the.destroyed) {
            return;
        }

        the.visible = false;
        the.decorated = false;
        the.destroyed = true;

        var next = function next() {
            modification.remove(the.viewEl);
            modification.remove(the.styleEl);
            the.app = the.viewEl = the.options
                = the.styleEl = the.route
                = the.controller = the.route.view
                = null;
            View.parent.destroy(the);
        };

        var destroy = fun.noop(controller.destroy);

        // async destroy
        // destroy(view, route, next);
        if (destroy.length === 3) {
            destroy(the, the.route, next);
        }
        // sync destroy
        // destroy(app, route);
        else {
            destroy(the, the.route);
            next(true);
        }
    }
});
var _getViewOptions = View.sole();


/**
 * 获取视图的配置
 * @returns {{}}
 */
View.method(_getViewOptions, function (isShow) {
    var the = this;
    var route = the.route;
    var relativedRoute = isShow ? route.prev : route.next;
    var aniOptions = {};

    if (relativedRoute) {
        var relativedTime = relativedRoute.state.timeStamp;
        var thisTime = route.state.timeStamp;
        aniOptions.direction = ( isShow ? thisTime > relativedTime : thisTime < relativedTime )
            ? 'forward' : 'back';
    } else {
        aniOptions.direction = 'none';
    }

    return aniOptions;
});


module.exports = View;
