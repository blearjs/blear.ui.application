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

var htmlViews = require('./views.html', 'html');
var View = require('./_view.js');


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
        the[_viewsEl] = modification.insert(viewsEl, el);

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

            // 二次
            if (prevView) {
                // query 变化
                if (thisView === prevView) {
                    the.emit('beforeViewUpdate', thisView, route);
                    thisView._update(route, next);
                    the.emit('afterViewUpdate', thisView, route);
                }
                // path 变化
                else {
                    the[_startTransition]();
                    the.emit('beforeViewLeave', thisView, route);
                    prevView._leave(route.prev, function (can) {
                        next(can);

                        // 前一个 view 拒绝离开
                        if (!can) {
                            the[_stopTransition]();
                            return;
                        }

                        the.emit('afterViewLeave', thisView, route);
                        the.emit('beforeViewHide', thisView, route);
                        prevView._hide();
                        the.emit('afterViewHide', thisView, route);

                        // 旧 view 重新进入
                        if (oldView === thisView) {
                            the.emit('beforeViewUpdate', thisView, route);
                            thisView._update(route, function () {
                                the.emit('afterViewUpdate', thisView, route);
                                the.emit('beforeViewShow', thisView, route);
                                thisView._show();
                                the.emit('afterViewShow', thisView, route);
                                the[_stopTransition]();
                            });
                        } else {
                            the.emit('beforeViewEnter', thisView, route);
                            thisView._enter(route, function () {
                                the.emit('afterViewEnter', thisView, route);
                                the.emit('beforeViewShow', thisView, route);
                                thisView._show();
                                the.emit('afterViewShow', thisView, route);
                                the[_stopTransition]();
                            });
                        }
                    });
                }
            }
            // 首次进入
            else {
                next(true);
                the.emit('beforeViewEnter', thisView, route);
                thisView._enter(route, function () {
                    the.emit('afterViewEnter', thisView, route);
                    the.emit('beforeViewShow', thisView, route);
                    thisView._show();
                    the.emit('afterViewShow', thisView, route);
                    the[_stopTransition]();
                });
            }
        };

        // 路由变化之后
        the.router.on('afterChange', function (route, changed) {
            the[_processing] = false;
        });


        event.on(win, 'resize', the[_onResize] = function () {
            var width = layout.innerWidth(el);
            var height = layout.innerHeight(el);
            var size = the[_latestSize] = {
                width: width,
                height: height
            };

            attribute.style(the[_viewsEl], size);
            array.each(the[_viewsList], function (index, view) {
                view._size(size);
            });
        });

        the[_onResize]();
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
var _thisView = Application.sole();
var _onResize = Application.sole();
var _latestSize = Application.sole();
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
    view._size(the[_latestSize]);

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

    // 超过最大长度
    if (the[_viewsList].length > the[_options].maxLength) {
        var oldestView = the[_viewsList].shift();
        oldestView._destroy();
        the[_viewsIdMap][oldestView.id] = null;
        the.emit('dropView', oldestView);
    }

    return view;
};


require('./style.css', 'css|style');
Application.defaults = defaults;
module.exports = Application;

