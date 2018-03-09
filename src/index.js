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

var Engine = require('./engine');

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
        the[_engineMap] = {};
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
            = the[_engineMap]
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
var _getEngine = sole();
var _engineMap = sole();
var _controllerId = sole();
var _prevController = sole();


prop[_initNode] = function () {
    var the = this;
    var options = the[_options];

    the[_viewsEl] = selector.query(options.el)[0];
    attribute.addClass(the[_viewsEl], namespace + '-views');

    if (options.platform === 'mobile') {
        var fullpageClassName = namespace + '-fullpage';
        attribute.addClass(document.documentElement, fullpageClassName);
        attribute.addClass(document.body, fullpageClassName);
        require('./style.css', 'css|style');
    }
};

prop[_initEvent] = function () {
    var the = this;

    the[_router].on('beforeChange', function (route) {

    });

    the[_router].on('afterChange', function (route) {
        var controller = route.controller;
        var nextEngine = the[_getEngine](controller);
        var prevEngine = the[_getEngine](the[_prevController]);

        // 同一个控制器：页面刷新进入
        if (the[_prevController] === controller) {
            nextEngine.replace(route, controller);
        }
        // 不同控制器
        else {
            // 旧页面
            if (prevEngine) {
                prevEngine.hide(route, the[_prevController]);
            }

            nextEngine.enter(route, controller);
        }

        the[_prevController] = controller;
    });
};

prop[_getEngine] = function (controller) {
    var the = this;

    if (!controller) {
        return null;
    }

    var controllerId = controller[_controllerId] = controller[_controllerId] || nextControllerId();
    var options = the[_options];

    return the[_engineMap][controllerId] ||
        (the[_engineMap][controllerId] = new Engine(the[_viewsEl], options.platform, options.showAnimation, options.hideAnimation));
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
