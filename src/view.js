/**
 * 视图
 * @author ydr.me
 * @create 2016-05-05 19:07
 * @update 2018年03月08日10:27:11
 */



'use strict';

var Class = require('blear.classes.class');
var modification = require('blear.core.modification');
var layout = require('blear.core.layout');
var fun = require('blear.utils.function');
var object = require('blear.utils.object');
var random = require('blear.utils.random');
var scopeCSS = require('blear.utils.scope-css');
var time = require('blear.utils.time');

var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
var docTitle = document.title;
var namespace = 'blearui-application-view';
var viewId = 0;
var View = Class.extend({
    className: 'View',
    constructor: function (viewsEl, platform, showAnimation, hideAnimation) {
        var the = this;

        View.parent(the);
        the.viewsEl = viewsEl;
        the.id = namespace + '-' + viewId++;
        the.styleEl = modification.create('style', {
            class: namespace,
            id: the.id + '-style'
        });
        the.el = modification.create('div', {
            class: namespace,
            id: the.id + '-div'
        });
        the[_scrollTop] = 0;
        the[_platform] = platform;
        the[_showAnimation] = showAnimation;
        the[_hideAnimation] = hideAnimation;
        the[_installed] = false;
    },

    /**
     * 注入结构
     * @param html
     * @param [keepSpace]
     */
    html: function (html, keepSpace) {
        var the = this;
        the.el.innerHTML = keepSpace ? html : removeHTMLSpace(html);
        return the;
    },

    /**
     * 注入样式
     * @param text
     * @param [global] {Boolean} 是否为全局样式
     */
    style: function (text, global) {
        var the = this;

        if (!global) {
            text = scopeCSS(text, '#' + the.el.id);
        }

        modification.importStyle(text, the.styleEl, true);
        return the;
    },

    /**
     * 修改文档标题
     * @param title
     * @returns {View}
     */
    title: function (title) {
        var the = this;

        // 待修改的标题等于当前标题，则不作为
        if (title === doc.title) {
            return the;
        }

        doc.title = title || docTitle;

        if (!isIOS) {
            return the;
        }

        var faviconIframe = modification.create('iframe', {
            style: {
                display: 'none'
            },
            src: '/favicon.ico'
        });
        faviconIframe.onload = function () {
            time.nextTick(function () {
                modification.remove(faviconIframe);
            });
        };
        modification.insert(faviconIframe);
        return the;
    },

    enter: function (route, ctrl) {
        var the = this;
        var options = {
            // 首个 view 进入，则方向为空
            direction: viewId === 1 ? 'none' : route.direction
        };

        modification.insert(the.styleEl, the.viewsEl);
        modification.insert(the.el, the.viewsEl);

        if (!the[_installed]) {
            the[_exec](ctrl.install, route);
            the[_installed] = true;
        }

        the[_showAnimation](the.el, options, function () {
            if (options.direction !== 'backward') {
                the[_scrollTop] = 0;
            }

            layout.scrollTop(the.el, the[_scrollTop]);
            the[_exec](ctrl.show, route);
            the[_exec](ctrl.update, route);
        });
    },

    hide: function (route, ctrl) {
        var the = this;
        var options = {
            direction: route.direction
        };
        the[_scrollTop] = layout.scrollTop(the.el);
        the[_hideAnimation](the.el, options, function () {
            the[_exec](ctrl.hide, route);
            modification.remove(the.styleEl);
            modification.remove(the.el);
        });
    },

    replace: function (route, ctrl) {
        this[_exec](ctrl.update, route);
    }
});
var prop = View.prototype;
var sole = View.sole;
var _showAnimation = sole();
var _hideAnimation = sole();
var _installed = sole();
var _exec = sole();
var _platform = sole();
var _scrollTop = sole();

module.exports = View;

prop[_exec] = function (callback, route) {
    fun.ensure(callback).call(window, this, route);
};

// ========================================================

/**
 * 移除 HTML 里的多余空白
 * @param html
 * @returns {string}
 */
function removeHTMLSpace(html) {
    var originalRE = /<(textarea|script|pre|code)\b[\s\S]*?>[\s\S]*?<\/\1>/gi;
    var tagRE = /<\/?[\w-]+[\s\S]*?>/g;
    var longSpaceRE = /\s+/g;
    var orginalMap = {};
    var store = function (source) {
        var key = '∆' + random.guid() + '∆';
        orginalMap[key] = source;
        return key;
    };

    html = html
        .replace(originalRE, store)
        .replace(tagRE, store)
        .replace(longSpaceRE, '');

    // 恢复
    object.each(orginalMap, function (key, val) {
        html = html.replace(key, val);
    });

    return html;
}

