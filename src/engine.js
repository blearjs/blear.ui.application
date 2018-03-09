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
var viewId = 0;
var Viewer = Class.extend({
    className: 'Viewer',
    constructor: function (viewsEl, platform, showAnimation, hideAnimation) {
        var the = this;

        Viewer.parent(the);
        the.viewsEl = viewsEl;
        var id = namespace + '-' + viewId++;
        var styleEl = the[_styleEl] = modification.create('style', {
            class: namespace,
            id: id + '-style'
        });
        var viewEl = the[_viewEl] = modification.create('section', {
            class: namespace,
            id: id + '-section'
        });

        the[_view] = new View(viewsEl, viewEl, styleEl);
        the[_scrollTop] = 0;
        the[_platform] = platform;
        the[_showAnimation] = showAnimation;
        the[_hideAnimation] = hideAnimation;
        the[_installed] = false;
    },

    /**
     * 视图进入
     * @param route
     * @param ctrl
     */
    enter: function (route, ctrl) {
        var the = this;
        var options = {
            // 首个 view 进入，则方向为空
            direction: viewId === 1 ? 'none' : route.direction
        };

        modification.insert(the[_styleEl], the.viewsEl);
        modification.insert(the[_viewEl], the.viewsEl);

        if (!the[_installed]) {
            the[_installed] = true;
            the[_exec](ctrl.install, route);
        }

        the[_view].title(ctrl.title);
        the[_exec](ctrl.show, route);
        the[_exec](ctrl.update, route);
        the[_showAnimation](the[_viewEl], options, function () {
            if (options.direction !== 'backward') {
                the[_scrollTop] = 0;
            }

            layout.scrollTop(the[_viewEl], the[_scrollTop]);
        });
    },

    /**
     * 视图隐藏
     * @param route
     * @param ctrl
     */
    hide: function (route, ctrl) {
        var the = this;
        var options = {
            direction: route.direction
        };
        the[_exec](ctrl.hide, route);
        the[_scrollTop] = layout.scrollTop(the[_viewEl]);
        the[_hideAnimation](the[_viewEl], options, function () {
            modification.remove(the[_styleEl]);
            modification.remove(the[_viewEl]);
        });
    },

    /**
     * 视图替换
     * @param route
     * @param ctrl
     */
    replace: function (route, ctrl) {
        this[_exec](ctrl.update, route);
    }
});
var prop = Viewer.prototype;
var sole = Viewer.sole;
var _view = sole();
var _showAnimation = sole();
var _hideAnimation = sole();
var _installed = sole();
var _exec = sole();
var _platform = sole();
var _scrollTop = sole();
var _viewEl = sole();
var _styleEl = sole();

module.exports = Viewer;

prop[_exec] = function (callback, route) {
    fun.ensure(callback).call(window, this[_view], route);
};

