/**
 * Application
 * @author ydr.me
 * @create 2016-04-29 10:24
 * @update 2018年03月08日10:27:04
 */



'use strict';

var UI = require('blear.ui');
var attribute = require('blear.core.attribute');
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
        the[_viewMap] = {};
        the[_initNode]();
        the[_initEvent]();
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
var _controllerId = sole();
var _prevControllerId = sole();

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
        var controllerId = ctrl[_controllerId] = ctrl[_controllerId] || nextControllerId();
        var nextView = the[_getView](controllerId);
        var prevView = the[_getView](the[_prevControllerId]);

        // 同一个控制器：页面刷新进入
        if (the[_prevControllerId] === controllerId) {
            nextView.replace(route, ctrl);
        }
        // 不同控制器
        else {
            // 页面重新进入
            if (prevView) {
                prevView.hide(route, ctrl, function () {
                    nextView.enter(route, ctrl);
                });
            }
            // 页面首次进入
            else {
                nextView.enter(route, ctrl);
            }
        }

        the[_prevControllerId] = controllerId;
    });
};

prop[_getView] = function (controllerId) {
    var the = this;

    if (!controllerId) {
        return null;
    }

    var options = the[_options];

    return the[_viewMap][controllerId] ||
        (the[_viewMap][controllerId] = new View(the[_viewsEl], options.platform, options.showAnimation, options.hideAnimation));
};


Application.defaults = defaults;
module.exports = Application;

// ==================================
var controllerId = 1;

/**
 * 下一个 controller Id
 * @returns {number}
 */
function nextControllerId() {
    return controllerId++;
}
