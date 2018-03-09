/**
 * 文件描述
 * @author ydr.me
 * @create 2016-04-29 20:17
 */




'use strict';

var Application = require('../src/index.js');
var Loading = require('blear.ui.loading');
var random = require('blear.utils.random');
var Router = require('blear.classes.router');
var attribute = require('blear.core.attribute');
var transform = require('blear.core.transform');

var router = window.router = new Router();
var loading = window.loading = new Loading();

router
    .match('/user/:userId', function (resolve) {
        require.async('./pages/page1.js', function (exports) {
            setTimeout(function () {
                resolve(exports);
            }, 1000);
        });
    })
    .match('/page2', function (resolve) {
        require.async('./pages/page2.js', function (exports) {
            setTimeout(function () {
                resolve(exports);
            }, 1000);
        });
    })
    .match(/^\/page3/, function (resolve) {
        require.async('./pages/page3.js', function (exports) {
            setTimeout(function () {
                resolve(exports);
            }, 1000);
        });
    })
    .match('/page4', function () {
        var exports = {};

        exports.install = function (view, route) {
            console.log('<page4>', '[enter]', route);
            var style = '.page-4{background:#ccc;}';
            view.html('<div class="page page-4"><h1>page 4 query.x=' + route.query.x + '</h1></div>');
            view.style(style);
        };
        exports.update = function (view, route) {
            console.log('<page4>', '[update]', route);
            view.html('<div class="page page-4"><h1>page 4 query.x=' + route.query.x + '</h1></div>');
        };
        exports.hide = function (view, route) {
            console.log('<page4>', '[leave]', route);
        };

        return exports;
    })
    .otherwise(function (resolve) {
        require.async('./pages/404.js', resolve);
    });

var transformOptions = {
    easing: [.4, .6, .2, 1],
    duration: 1000
};
var app = window.app = new Application(router, {
    el: '#app',
    showAnimation: function (el, options, next) {
        var next2 = function () {
            // 把 transform 从 dom 中删除，否则会影响 zIndex
            // <div1 style="transform: ...."><div2 style="z-index: 10000"></div2></div1>
            // <div3 style="z-zndex:2"></div3>
            // 此时 div3 竟然是遮挡着 div1 的
            attribute.style(el, 'transform', '');
            next();
        };
        switch (options.direction) {
            case 'none':
                attribute.style(el, {
                    opacity: 0
                });
                transform.transit(el, {
                    opacity: 1
                }, transformOptions, next2);
                break;

            case 'forward':
                attribute.style(el, {
                    transform: {
                        translateX: '100%'
                    },
                    opacity: 0
                });
                transform.transit(el, {
                    transform: {
                        translateX: 0
                    },
                    opacity: 1
                }, transformOptions, next2);
                break;

            case 'backward':
                attribute.style(el, {
                    transform: {
                        translateX: '-33%'
                    },
                    opacity: 0
                });
                transform.transit(el, {
                    transform: {
                        translateX: 0
                    },
                    opacity: 1
                }, transformOptions, next2);
                break;
        }
    },
    hideAnimation: function (el, options, done) {
        switch (options.direction) {
            case 'forward':
                attribute.style(el, {
                    transform: {
                        translateX: 0
                    },
                    opacity: 1
                });
                transform.transit(el, {
                    transform: {
                        translateX: '-33%'
                    },
                    opacity: 0
                }, transformOptions, done);
                break;

            case 'backward':
                attribute.style(el, {
                    transform: {
                        translateX: 0
                    },
                    opacity: 1
                });
                transform.transit(el, {
                    transform: {
                        translateX: '100%'
                    },
                    opacity: 0
                }, transformOptions, done);
                break;
        }
    }
});

app
    .on('beforeTransition', function (route) {
        loading.open();
    })
    .on('afterTransition', function (route) {
        loading.close();
    });


document.getElementById('link404').onclick = function () {
    router.redirect('/404/' + random.string());
};
document.getElementById('linkPage1').onclick = function () {
    router.redirect('/user/' + random.number(1, 100) + '/?a=1');
};
document.getElementById('linkPage2').onclick = function () {
    router.redirect('/page2?r=' + random.number(1, 100));
};
document.getElementById('linkPage3').onclick = function () {
    router.redirect('/page3/?s=' + random.number(1, 100));
};
document.getElementById('linkPage4').onclick = function () {
    router.redirect('/page4/?x=' + random.number(1, 100));
};

router.start();
