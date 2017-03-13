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
var ensureFun = fun.ensure;

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
        view.viewsEl = viewsEl;
        view.el = modification.insert(viewEl, viewsEl);
        // view.el = selector.children(viewEl)[0];
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

        morphDom(view.el, '<div>' + html + '</div>', {
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
            style = scopeCSS(style, '#' + view.el.id);
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

        // 待修改的标题等于当前标题，则不作为
        if (title === doc.title) {
            return view;
        }

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
        attribute.style(this.el, size);
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
        next = ensureFun(next);

        var callback = function (boolean) {
            next(boolean);
            view.title(controller.title);
            attribute.addClass(view.el, controller.name || '');
        };

        if (view.destroyed) {
            return callback(true);
        }

        var enter = ensureFun(controller.enter);
        var watch = ensureFun(controller.watch);

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
        next = ensureFun(next);

        if (view.destroyed) {
            return next(true);
        }

        var callback = function (boolean) {
            next(boolean);
            view.title(controller.title);
        };

        var update = ensureFun(controller.update);
        var watch = ensureFun(controller.watch);

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
        callback = ensureFun(callback);

        if (!view.visible || view.destroyed) {
            return callback(true);
        }

        var next = function next(can) {
            // 当前 view 拒绝离开
            if (!can) {
                return callback(can);
            }

            view.state.scrollTop = layout.scrollTop(view.el);
            callback(can);
        };
        var leave = ensureFun(controller.leave);
        var watch = ensureFun(controller.watch);

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
        var viewEl = view.el;

        callback = ensureFun(callback);

        if (view.destroyed || view.visible) {
            return callback(true);
        }

        var beforeShow = ensureFun(controller.beforeShow);
        var show = ensureFun(controller.show);
        var afterShow = ensureFun(controller.afterShow);
        var viewOptions = view[_getViewOptions](true);
        var watch = ensureFun(controller.watch);

        watch(view, route);
        view.visible = true;
        view.viewsEl.appendChild(viewEl);
        attribute.show(viewEl);
        show(view, route);

        if (viewOptions.direction !== 'back') {
            view.state.scrollTop = 0;
        }

        layout.scrollTop(viewEl, view.state.scrollTop);
        beforeShow(viewOptions);
        options.showAnimation(viewEl, viewOptions, function () {
            afterShow(viewOptions);
            callback(true);
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
        var viewEl = view.el;

        callback = ensureFun(callback);

        if (!view.visible || view.destroyed) {
            return callback(true);
        }

        var beforeHide = ensureFun(controller.beforeHide);
        var hide = ensureFun(controller.hide);
        var afterHide = ensureFun(controller.afterHide);
        var viewOptions = view[_getViewOptions](false);
        var watch = ensureFun(controller.watch);

        watch(view, route);
        view.visible = false;

        var next = function () {
            beforeHide(viewOptions);
            options.hideAnimation(viewEl, viewOptions, function () {
                attribute.hide(viewEl);
                view.viewsEl.removeChild(viewEl);
                afterHide(viewOptions);
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
        var route = view.route;

        if (view.destroyed) {
            return;
        }

        view.visible = false;
        view.decorated = false;
        view.destroyed = true;

        var next = function next() {
            modification.remove(view.el);
            modification.remove(view.styleEl);
            view.app = view.el = view.options
                = view.styleEl = view.route
                = view.controller = view.route.view
                = null;
            View.invoke('destroy', view);
        };

        var destroy = ensureFun(controller.destroy);
        var watch = ensureFun(controller.watch);

        watch(view, route);

        // async destroy
        // destroy(view, route, next);
        if (destroy.length === 3) {
            destroy(view, route, next);
        }
        // sync destroy
        // destroy(app, route);
        else {
            destroy(view, route);
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
