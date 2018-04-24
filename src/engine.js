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
        var styleEl = the[_styleEl] = modification.create('style', {
            class: namespace,
            id: id + '-style'
        });
        var viewEl = the[_viewEl] = modification.create('div', {
            class: namespace,
            id: id + '-div'
        });

        the[_view] = new View(id, viewsEl, viewEl, styleEl);
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
     */
    enter: function (route, ctrl) {
        var the = this;
        var options = {
            // 首个 view 进入，则方向为空
            direction: engineId === 1 ? 'none' : route.direction
        };

        modification.insert(the[_styleEl], the.viewsEl);
        modification.insert(the[_viewEl], the.viewsEl);
        the[_view].visible = true;

        if (!the[_installed]) {
            the[_installed] = true;
            the[_exec](ctrl.install, route);
        }

        the[_route] = route;
        the[_view].title(ctrl.title);
        the[_exec](ctrl.show, route);
        the[_exec](ctrl.update, route);
        the[_showAnimation](the[_viewEl], options, function () {
            if (options.direction !== 'back') {
                the[_scrollTop] = 0;
            }

            layout.scrollTop(the[_viewEl], the[_scrollTop]);
        });
    },

    /**
     * 引擎离开
     * @param route
     * @param ctrl
     */
    leave: function (route, ctrl) {
        // 此时传入的下一个引擎的路由
        var the = this;
        var options = {
            direction: route.direction
        };
        the[_view].visible = false;
        the[_exec](ctrl.hide, the[_route], route);
        the[_scrollTop] = layout.scrollTop(the[_viewEl]);
        the[_hideAnimation](the[_viewEl], options, function () {
            modification.remove(the[_styleEl]);
            modification.remove(the[_viewEl]);
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
var _view = sole();
var _showAnimation = sole();
var _hideAnimation = sole();
var _installed = sole();
var _exec = sole();
var _platform = sole();
var _scrollTop = sole();
var _viewEl = sole();
var _styleEl = sole();
var _route = sole();

module.exports = Engine;

prop[_exec] = function (callback, route, nextRoute) {
    fun.ensure(callback).call(window, this[_view], route, nextRoute);
};

