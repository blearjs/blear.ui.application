/**
 * 视图管理类
 * @author ydr.me
 * @create 2016-05-05 19:07
 * @update 2018年03月08日10:27:11
 */



'use strict';

var Class = require('blear.classes.class');
var modification = require('blear.core.modification');
var layout = require('blear.core.layout');
var fun = require('blear.utils.function');
var event = require('blear.core.event');
var attribute = require('blear.core.attribute');
var selector = require('blear.core.selector');

var View = require('./view');

var namespace = 'blearui-application-view';
var engineId = 0;
var Engine = Class.extend({
    className: 'Engine',
    constructor: function (viewsEl, platform, showAnimation, hideAnimation) {
        var the = this;

        Engine.parent(the);
        the.viewsEl = viewsEl;
        var id = namespace + '-' + engineId++;
        var styleEl = modification.create('style', {
            class: namespace,
            id: id + '-style'
        });
        var viewEl = modification.create('div', {
            class: namespace,
            id: id + '-div'
        });

        the.view = new View(id, viewsEl, viewEl, styleEl);
        the.view.styleEl = styleEl;
        the.view.el = the.view.viewEl = viewEl;
        the[_scrollTop] = 0;
        the[_platform] = platform;
        the[_showAnimation] = showAnimation;
        the[_hideAnimation] = hideAnimation;
        the[_installed] = false;
    },

    /**
     * 引擎进入
     * @param route
     * @param ctrl
     * @param callback
     */
    enter: function (route, ctrl, callback) {
        var the = this;
        var options = {
            // 首个 view 进入，则方向为空
            direction: engineId === 1 ? 'none' : route.direction
        };

        modification.insert(the.view.styleEl, the.viewsEl);
        modification.insert(the.view.el, the.viewsEl);
        the.view.visible = true;

        if (!the[_installed]) {
            the[_installed] = true;
            the[_exec](ctrl.install, route);

            // MVVM 会将根节点进行替换，需要重新查找
            var viewEl = the.view.el = the.view.viewEl = selector.query('#' + the.view.elId)[0];

            // 监听 a[redirect]、a[rewrite]
            event.on(viewEl, 'click', 'a[redirect]', function (ev) {
                route.redirect(attribute.attr(this, 'redirect'));
                ev.preventDefault();
            });
            event.on(viewEl, 'click', 'a[rewrite]', function (ev) {
                route.redirect(attribute.attr(this, 'rewrite'));
                ev.preventDefault();
            });
        }

        the[_route] = route;
        the.view.title(ctrl.title);
        the[_exec](ctrl.show, route);
        the[_exec](ctrl.update, route);
        the[_showAnimation](the.view.el, options, function () {
            if (options.direction !== 'back') {
                the[_scrollTop] = 0;
            }

            layout.scrollTop(the.view.el, the[_scrollTop]);
            callback();
        });
    },

    /**
     * 引擎离开
     * @param route
     * @param ctrl
     * @param callback
     */
    leave: function (route, ctrl, callback) {
        // 此时传入的下一个引擎的路由
        var the = this;
        var options = {
            direction: route.direction
        };
        the.view.visible = false;
        the[_exec](ctrl.hide, the[_route], route);
        the[_scrollTop] = layout.scrollTop(the.view.el);
        the[_hideAnimation](the.view.el, options, function () {
            modification.remove(the.view.styleEl);
            modification.remove(the.view.el);
            callback();
        });
    },

    /**
     * 引擎重启
     * @param route
     * @param ctrl
     */
    reload: function (route, ctrl) {
        var the = this;

        the[_route] = route;
        the[_exec](ctrl.update, route);
    }
});
var prop = Engine.prototype;
var sole = Engine.sole;
var _showAnimation = sole();
var _hideAnimation = sole();
var _installed = sole();
var _exec = sole();
var _platform = sole();
var _scrollTop = sole();
var _route = sole();

module.exports = Engine;

prop[_exec] = function (callback, route, nextRoute) {
    this.route = route;
    fun.ensure(callback).call(window, this.view, route, nextRoute);
};

