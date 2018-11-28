/**
 * 视图类
 * @author ydr.me
 * @create 2018-03-09 14:52
 * @update 2018-03-09 14:52
 */


'use strict';

var Class = require('blear.classes.class');
var scopeCSS = require('blear.utils.scope-css');
var time = require('blear.utils.time');
var modification = require('blear.core.modification');
var object = require('blear.utils.object');
var random = require('blear.utils.random');

var doc = document;
var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
var docTitle = doc.title;
var View = Class.extend({
    className: 'View',
    constructor: function (id, viewsEl, viewEl, styleEl) {
        var the = this;

        View.parent(the);
        the.viewsEl = viewsEl;
        the.id = id;
        the.el = the.viewEl = viewEl;
        the.elId = the.el.id;
        the.styleEl = styleEl;
        the[_title] = doc.title;
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
            the[_title] = doc.title;
            return the;
        }

        the[_title] = doc.title = title || docTitle;

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

    /**
     * 获取当前视图标题
     * @returns {string}
     */
    getTitle: function () {
        return this[_title];
    }
});


var sole = View.sole;
var _title = sole();

module.exports = View;

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

