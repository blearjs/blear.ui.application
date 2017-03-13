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
var array = require('blear.utils.array');
var selector = require('blear.core.selector');
var attribute = require('blear.core.attribute');
var modification = require('blear.core.modification');
var event = require('blear.core.event');
var layout = require('blear.core.layout');

var View = require('./_view.js');

var win = window;
var doc = win.document;
var htmlEl = doc.documentElement;
var bodyEl = doc.body;
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
     * @param viewOptions
     * @param done
     */
    showAnimation: function (el, viewOptions, done) {
        done();
    },

    /**
     * 隐藏动画，可以根据参数来实现过场动画
     * @param el
     * @param viewOptions
     * @param done
     */
    hideAnimation: function (el, viewOptions, done) {
        done();
    }
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

        the.router.on('beforeLoad', function () {
            the[_startTransition]();
        });

        the.router._change = function (route, next) {
            var can = !the[_processing];

            if (!can) {
                next(can);
                the[_stopTransition]();
                return;
            }

            the[_processing] = true;

            var oldView = the[_getViewByRoute](route);
            var prevView = the[_getViewByRoute](route.prev);
            // 在后
            var thisView = the[_thisView] = the[_getThisViewByRoute](route);
            var paramRoute = the[_cleanRoute](route);
            paramRoute.prev = the[_cleanRoute](route.prev);
            paramRoute.next = the[_cleanRoute](route.next);

            // 二次
            if (prevView) {
                // query 变化
                if (thisView === prevView) {
                    the.emit('beforeViewUpdate', thisView, paramRoute);
                    thisView._update(route, next);
                    the.emit('afterViewUpdate', thisView, paramRoute);
                }
                // path 变化
                else {
                    the[_startTransition]();
                    the.emit('beforeViewLeave', thisView, paramRoute);
                    prevView._leave(route.prev, function (can) {
                        next(can);

                        // 前一个 view 拒绝离开
                        if (!can) {
                            the[_stopTransition]();
                            return;
                        }

                        the.emit('afterViewLeave', thisView, paramRoute);
                        the.emit('beforeViewHide', thisView, paramRoute);
                        prevView._hide();
                        the.emit('afterViewHide', thisView, paramRoute);

                        // 旧 view 重新进入
                        if (oldView === thisView) {
                            the.emit('beforeViewUpdate', thisView, paramRoute);
                            thisView._update(route, function () {
                                the.emit('afterViewUpdate', thisView, paramRoute);
                                the.emit('beforeViewShow', thisView, paramRoute);
                                thisView._show();
                                the.emit('afterViewShow', thisView, paramRoute);
                                the[_stopTransition]();
                            });
                        } else {
                            the.emit('beforeViewEnter', thisView, paramRoute);
                            thisView._enter(route, function () {
                                the.emit('afterViewEnter', thisView, paramRoute);
                                the.emit('beforeViewShow', thisView, paramRoute);
                                thisView._show();
                                the.emit('afterViewShow', thisView, paramRoute);
                                the[_stopTransition]();
                            });
                        }
                    });
                }
            }
            // 首次进入
            else {
                next(true);
                the.emit('beforeViewEnter', thisView, paramRoute);
                thisView._enter(route, function () {
                    the.emit('afterViewEnter', thisView, paramRoute);
                    the.emit('beforeViewShow', thisView, paramRoute);
                    thisView._show();
                    the.emit('afterViewShow', thisView, paramRoute);
                    the[_stopTransition]();
                });
            }
        };

        // 路由变化之后
        the.router.on('afterChange', function (route, changed) {
            the[_processing] = false;
        });

        the[_initNode]();
        the[_initStyle]();
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
var _initNode = Application.sole();
var _initStyle = Application.sole();
var _startTransition = Application.sole();
var _stopTransition = Application.sole();
var _thisView = Application.sole();
var _onResize = Application.sole();
var _latestSize = Application.sole();
var _cleanRoute = Application.sole();
var pro = Application.prototype;

pro[_initNode] = function () {
    var the = this;
    var options = the[_options];
    var el = selector.query(options.el)[0];

    the[_viewsEl] = el;
    attribute.addClass(el, namespace + '-views');
};

pro[_initStyle] = function () {
    var the = this;
    var options = the[_options];

    if (options.platform !== 'mobile') {
        return;
    }

    require('./style.css', 'css|style');
    var fullpageClassName = namespace + '-fullpage';
    attribute.addClass(htmlEl, fullpageClassName);
    attribute.addClass(bodyEl, fullpageClassName);
};

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

    /**
     * 判断当前视图是否前置
     * @returns {boolean}
     */
    view.is = function () {
        return view === the[_thisView];
    };

    the[_viewsList].push(view);
    the[_viewsIdMap][view.id] = view;
    the.emit('pushView', view);

    // // 超过最大长度
    // if (the[_viewsList].length > the[_options].maxLength) {
    //     var oldestView = the[_viewsList].shift();
    //     oldestView._destroy();
    //     the[_viewsIdMap][oldestView.id] = null;
    //     the.emit('dropView', oldestView);
    // }

    return view;
};


// 清洁 route
pro[_cleanRoute] = function (route) {
    if (!route) {
        return null;
    }

    return object.filter(route, [
        'data',
        'path',
        'pathname',
        'rule',
        'query',
        'params'
    ]);
};


Application.defaults = defaults;
module.exports = Application;

