/**
 * Application
 * @author ydr.me
 * @create 2016-04-29 10:24
 */


/**
 *
 * @module ui/Application
 */

'use strict';

var UI = require('blear.ui');
var object = require('blear.utils.object');
var typeis = require('blear.utils.typeis');
var selector = require('blear.core.selector');
var attribute = require('blear.core.attribute');
var modification = require('blear.core.modification');
var htmlViews = require('./views.html', 'html');
var View = require('./_view.js');

var namespace = UI.UI_CLASS + '-application';
var overflowClass = namespace + '-overflow';
var win = window;
var doc = win.document;
var htmlEl = doc.documentElement;
var bodyEl = doc.body;
var defaults = {
    el: null,
    showAnimation: function (el, viewOptions, done) {
        attribute.show(el);
        done();
    },

    hideAnimation: function (el, viewOptions, done) {
        attribute.hide(el);
        done();
    },

    /**
     * 最大视图长度
     * @type Number
     */
    maxLength: 5
};


var Application = UI.extend({
    className: 'Application',
    constructor: function (router, options) {
        var the = this;

        the.router = router;
        the[_options] = options = object.assign(true, {}, defaults, options);
        Application.parent(the, options);
        the[_viewsList] = [];
        the[_viewsIdMap] = {};
        the[_routersIdMap] = {};
        the[_firstEnter] = true;
        // 是否正在处理
        the[_processing] = false;
        the[_transiting] = false;

        var el = selector.query(options.el)[0];
        // init node
        var viewsEl = modification.parse(htmlViews);

        el.innerHTML = '';
        attribute.addClass(el, overflowClass);
        the[_viewsEl] = modification.insert(viewsEl, el);

        // 路由变化之前
        the.router.on('beforeChange', function (route, next) {
            var can = !the[_processing];

            if (can) {
                // 当前控制器未加载过
                if (!router.done) {
                    the[_startTransition]();
                }

                next(can);
            } else {
                next(can);
            }
        });

        // 路由变化（控制器加载之后）
        the.router.on('change', function (route, next) {
            the[_processing] = true;

            var oldView = the[_getViewByRoute](route);
            var prevView = the[_getViewByRoute](route.prev);
            // 在后
            var thisView = the[_getThisViewByRoute](route);

            // 二次
            if (prevView) {
                // query 变化
                if (thisView === prevView) {
                    the[_stopTransition]();
                    thisView._update(route, next);
                }
                // path 变化
                else {
                    the[_startTransition]();
                    prevView._leave(route.prev, function (can) {
                        // 前一个 view 拒绝离开
                        if (!can) {
                            the[_stopTransition]();
                            return next(can);
                        }

                        prevView._hide();

                        // 旧 view 重新进入
                        if (oldView === thisView) {
                            thisView._update(route, function () {
                                the[_stopTransition]();
                                thisView._show(next);
                            });
                        } else {
                            thisView._enter(route, function () {
                                the[_stopTransition]();
                                thisView._show(next);
                            });
                        }
                    });
                }
            }
            // 首次进入
            else {
                thisView._enter(route, function () {
                    the[_stopTransition]();
                    thisView._show(next);
                });
            }
        });

        // 路由变化之后
        the.router.on('afterChange', function (changed) {
            the[_processing] = false;
        });
    },


    /**
     * 获取视图容器
     * @returns {*}
     */
    getViewsElement: function () {
        return this[_viewsEl];
    },


    /**
     * 销毁实例
     */
    destroy: function () {
        // do what
    }
});
var _options = Application.sole();
var _viewsEl = Application.sole();
var _firstEnter = Application.sole();
var _viewsList = Application.sole();
var _viewsIdMap = Application.sole();
var _routersIdMap = Application.sole();
var _getViewByRoute = Application.sole();
var _getThisViewByRoute = Application.sole();
var _processing = Application.sole();
var _transiting = Application.sole();
var _startTransition = Application.sole();
var _stopTransition = Application.sole();
var pro = Application.prototype;


/**
 * 开始过渡
 */
pro[_startTransition] = function () {
    var the = this;

    if (!the[_transiting]) {
        the[_transiting] = true;
        the.emit('beforeTransition');
    }
};


/**
 * 停止过渡
 */
pro[_stopTransition] = function () {
    var the = this;

    the[_transiting] = false;
    the.emit('afterTransition');
};

/**
 * 根据 id 获取历史视图
 * @param route
 * @returns {*}
 */
pro[_getViewByRoute] = function (route) {
    if (!route) {
        return;
    }

    return this[_viewsIdMap][route.id];
};


/**
 * 根据当前路由获取当前路由
 * @param route
 */
pro[_getThisViewByRoute] = function (route) {
    var the = this;
    var oldView = the[_getViewByRoute](route);

    if (oldView) {
        // 找到旧的 view，需要将这个 view 放到队尾，
        // 防止下次删除旧的 view 的时候被删除掉
        var findIndex = the[_viewsList].indexOf(oldView);

        the[_viewsList].splice(findIndex, 1);
        the[_viewsList].push(oldView);

        return oldView;
    }

    var view = new View(the, the[_options], route);

    the[_viewsList].push(view);
    the[_viewsIdMap][view.id] = view;
    the.emit('pushView', view);

    // 超过最大长度
    if (the[_viewsList].length > the[_options].maxLength) {
        var oldestView = the[_viewsList].shift();
        oldestView._destroy();
        the[_viewsIdMap][oldestView.id] = null;
        the.emit('dropView', oldestView);
    }

    return view;
};


attribute.addClass(htmlEl, overflowClass);
attribute.addClass(bodyEl, overflowClass);
require('./style.css', 'css|style');
Application.defaults = defaults;
module.exports = Application;

