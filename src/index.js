/**
 * Application
 * @author ydr.me
 * @create 2016-04-29 10:24
 * @update 2018年03月08日10:27:04
 */



'use strict';

var UI = require('blear.ui');
var attribute = require('blear.core.attribute');
var modification = require('blear.core.modification');
var selector = require('blear.core.selector');
var object = require('blear.utils.object');

var View = require('./view');

var namespace = 'blearui-application';
var defaults = {
    /**
     * 根元素
     */
    el: null,

    /**
     * 平台，可选：mobile/desktop
     */
    platform: 'mobile',

    /**
     * 显示动画，可以根据参数来实现过场动画
     * @param el
     * @param options
     * @param done
     */
    showAnimation: function (el, options, done) {
        done();
    },

    /**
     * 隐藏动画，可以根据参数来实现过场动画
     * @param el
     * @param options
     * @param done
     */
    hideAnimation: function (el, options, done) {
        done();
    }
};
var Application = UI.extend({
    className: 'Application',
    constructor: function (router, options) {
        var the = this;

        Application.parent(the);
        the[_router] = router;
        the[_options] = object.assign({}, defaults, options);
        the[_initNode]();
        the[_viewMap] = {};
    },

    /**
     * 销毁
     */
    destroy: function () {
        var the = this;

        the[_router]
            = the[_options]
            = the[_viewMap]
            = null;
        Application.invoke('destroy', the);
    }
});
var prop = Application.prototype;
var sole = Application.sole;
var _router = sole();
var _options = sole();
var _viewsEl = sole();
var _initNode = sole();
var _initEvent = sole();
var _getView = sole();
var _viewMap = sole();

prop[_initNode] = function () {
    var the = this;
    var options = the[_options];

    the[_viewsEl] = selector.query(options.el)[0];
    attribute.addClass(the[_viewsEl], namespace + '-views');
};

prop[_initEvent] = function () {
    var the = this;

    the[_router].on('afterChange', function (route) {
        var ctrl = route.controller;
        var nextView = the[_getView](route);
        var prevView = the[_getView](route.prev);

        // 路由方向不变
        if (route.direction === 'replace') {
            nextView.replace(route, ctrl);
        }
        // 路由方向变化
        else {
            if (prevView) {
                prevView.leave(route, ctrl, function () {
                    nextView.enter(route, ctrl);
                });
            } else {
                nextView.enter(route, ctrl);
            }
        }
    });
};

prop[_getView] = function (route) {
    var the = this;

    if (!route) {
        return null;
    }

    var routeId = route.id;
    var options = the[_options];

    return the[_viewMap][routeId] ||
        (the[_viewMap][routeId] = new View(the[_viewsEl], options.showAnimation, options.hideAnimation));
};



Application.defaults = defaults;
module.exports = Application;
