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
var attribute = require('blear.core.attribute');
var morphDom = require('blear.shims.morphdom');
var fun = require('blear.utils.function');
var time = require('blear.utils.time');
var scopeCSS = require('blear.utils.scope-css');


var htmlView = require('./view.html', 'html');


var namespace = UI.UI_CLASS + '-application';
var viewId = 0;
var win = window;
var doc = win.document;
var docTitle = doc.title;
var FAVICON = location.origin + '/favicon.ico';
var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);


var View = UI.extend({
    class: 'View',
    constructor: function (app, options, route) {
        var view = this;
        var viewEl = modification.parse(htmlView);
        var styleEl = modification.create('style');
        var viewsEl = app.getViewsElement();

        View.parent(view);
        view.app = app;
        view.options = options;
        view.route = route;
        view.route.view = view;
        view.controller = route.controller;
        view.id = route.id;
        viewEl.id = namespace + '-' + route.id + '-' + (viewId++);
        styleEl.id = namespace + '-' + route.id + '-' + (viewId++);
        view.viewEl = modification.insert(viewEl, viewsEl);
        view.styleEl = modification.insert(styleEl, viewsEl);
        view.visible = false;
        view.decorated = false;
        view.destroyed = false;
        view.state = {
            scrollTop: 0
        };

    },


    /**
     * 注入结构
     * @param html
     */
    html: function (html) {
        var view = this;

        if (view.destroyed) {
            return;
        }

        morphDom(view.viewEl, '<div>' + html + '</div>', {
            childrenOnly: true
        });

        return view;
    },

    /**
     * 注入样式
     * @param style
     * @param [_global] {Boolean} 是否为全局样式
     */
    style: function (style, _global) {
        var view = this;

        if (view.destroyed) {
            return;
        }

        if (!_global) {
            style = scopeCSS(style, '#' + view.viewEl.id);
        }

        modification.importStyle(style, view.styleEl, true);
        return view;
    },


    /**
     * 修改文档标题
     * @param title
     * @returns {View}
     */
    title: function (title) {
        var view = this;
        doc.title = title || docTitle;

        if (!isIOS) {
            return view;
        }

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
        return view;
    },


    /**
     * 设置 view 尺寸
     * @param size
     * @private
     */
    _size: function (size) {
        attribute.style(this.viewEl, size);
    },


    /**
     * 进入视图
     * @param route
     * @param next
     * @private
     */
    _enter: function (route, next) {
        var view = this;
        var controller = view.controller;

        view.route = route;
        view.route.view = view;
        next = fun.noop(next);

        var callback = function (boolean) {
            next(boolean);
            view.title(controller.title);
        };

        if (view.destroyed) {
            return callback(true);
        }

        var enter = fun.noop(controller.enter);
        var watch = fun.noop(controller.watch);

        watch(view, route);

        // async enter
        // enter(app, route, next);
        if (enter.length === 3) {
            enter(view, route, callback);
        }
        // sync enter
        // enter(app, route);
        else {
            enter(view, route);
            callback(true);
        }

        return view;
    },


    /**
     * 更新视图
     * @param route
     * @param next
     * @private
     */
    _update: function (route, next) {
        var view = this;
        var controller = view.controller;

        view.route = route;
        view.route.view = view;
        next = fun.noop(next);

        if (view.destroyed) {
            return next(true);
        }

        var callback = function (boolean) {
            next(boolean);
            view.title(controller.title);
        };

        var update = fun.noop(controller.update);
        var watch = fun.noop(controller.watch);

        watch(view, route);
        // async update
        // update(app, route, next);
        if (update.length === 3) {
            update(view, route, callback);
        }
        // sync update
        // update(app, route);
        else {
            update(view, route);
            callback(true);
        }
    },


    /**
     * 视图离开
     * @param route
     * @param callback
     * @private
     */
    _leave: function (route, callback) {
        var view = this;
        var controller = view.controller;

        view.route = route;
        view.route.view = view;
        callback = fun.noop(callback);

        if (!view.visible || view.destroyed) {
            return callback(true);
        }

        var next = function next(can) {
            // 当前 view 拒绝离开
            if (!can) {
                return callback(can);
            }

            view.state.scrollTop = layout.scrollTop(view.viewEl);
            callback(can);
        };
        var leave = fun.noop(controller.leave);
        var watch = fun.noop(controller.watch);

        watch(view, route);
        // async leave
        // leave(app, route, next);
        if (leave.length === 3) {
            leave(view, route, next);
        }
        // sync leave
        // leave(app, route);
        else {
            leave(view, route);
            next(true);
        }
    },


    /**
     * 视图显示
     * @param callback
     * @private
     */
    _show: function (callback) {
        var view = this;
        var controller = view.controller;
        var options = view.options;
        var route = view.route;

        callback = fun.noop(callback);

        if (view.destroyed || view.visible) {
            return callback(true);
        }

        var show = fun.noop(controller.show);
        var viewOptions = view[_getViewOptions](true);
        var watch = fun.noop(controller.watch);

        watch(view, route);
        view.visible = true;
        options.showAnimation(view.viewEl, viewOptions, function () {
            time.nextFrame(function () {
                layout.scrollTop(view.viewEl, view.state.scrollTop);
                show(view, route);
                callback(true);
            });
        });
    },


    /**
     * 视图隐藏
     * @param callback
     * @private
     */
    _hide: function (callback) {
        var view = this;
        var options = view.options;
        var controller = view.controller;
        var route = view.route;

        callback = fun.noop(callback);

        if (!view.visible || view.destroyed) {
            return callback(true);
        }

        var hide = fun.noop(controller.hide);
        var viewOptions = view[_getViewOptions](false);
        var watch = fun.noop(controller.watch);

        watch(view, route);
        view.visible = false;

        var next = function () {
            options.hideAnimation(view.viewEl, viewOptions, function () {
                callback(true);
            });
        };

        if (hide.length === 3) {
            hide(view, route, next);
        } else {
            hide(view, route);
            next();
        }
    },


    /**
     * 视图销毁
     * @private
     */
    _destroy: function () {
        var view = this;
        var controller = view.controller;

        if (view.destroyed) {
            return;
        }

        view.visible = false;
        view.decorated = false;
        view.destroyed = true;

        var next = function next() {
            modification.remove(view.viewEl);
            modification.remove(view.styleEl);
            view.app = view.viewEl = view.options
                = view.styleEl = view.route
                = view.controller = view.route.view
                = null;
            View.invoke('destroy', view);
        };

        var destroy = fun.noop(controller.destroy);
        var watch = fun.noop(controller.watch);

        watch(view, route);

        // async destroy
        // destroy(view, route, next);
        if (destroy.length === 3) {
            destroy(view, view.route, next);
        }
        // sync destroy
        // destroy(app, route);
        else {
            destroy(view, view.route);
            next(true);
        }
    }
});
var _getViewOptions = View.sole();
var pro = View.prototype;


/**
 * 获取视图的配置
 * @returns {{}}
 */
pro[_getViewOptions] = function (isShow) {
    var view = this;
    var route = view.route;
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
};


module.exports = View;
