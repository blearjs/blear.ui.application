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
    .match(function (next) {
        console.log('准备进入', this.href);
        next();
    })
    .match('/user/:userId', function (next) {
        console.log('模拟请求用户数据');
        setTimeout(function () {
            next();
        }, 100);
    })
    .get('/user/:userId', function (resolve) {
        require.async('./pages/page1.js', resolve);
    })
    .get('/page1', function (resolve) {
        require.async('./pages/page1.js', resolve);
    })
    .get('/page2', function (resolve) {
        require.async('./pages/page2.js', function (exports) {
            setTimeout(function () {
                resolve(exports);
            }, 1000);
        });
    })
    .get(/^\/page3/, function (resolve) {
        require.async('./pages/page3.js', function (exports) {
            setTimeout(function () {
                resolve(exports);
            }, 1000);
        });
    })
    .get('/page4', function () {
        var exports = {};

        exports.install = function (view, route) {
            console.log('<page4>', '[enter]', route);
            var style = '.page-4{background:#ccc;}';
            view.html('<div class="page page-4"><h1>page 4 query.x=' + route.query.x + '</h1></div>');
            view.style(style);
        };

        return exports;
    })
    .get(function (resolve) {
        require.async('./pages/404.js', resolve);
    });

var transformOptions = {
    easing: [.4, .6, .2, 1],
    duration: 456
};
var app = window.app = new Application(router, {
    el: '#app',
    platform: 'mobile',
    showAnimation2: function (el, options, next) {
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
    hideAnimation2: function (el, options, done) {
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

router
    .on('beforeLoad', function (route) {
        loading.open();
    })
    .on('afterLoad', function (route) {
        loading.close();
    });

app.on('beforeHide', function (view, route) {
    console.log('beforeHide', view, route)
});

app.on('afterHide', function (view, route) {
    console.log('afterHide', view, route)
});

app.on('beforeShow', function (view, route) {
    console.log('beforeShow', view, route)
});

app.on('afterShow', function (view, route) {
    console.log('afterShow', view, route)
});


document.getElementById('link404').onclick = function () {
    router.redirect('/404/' + random.string());
};
document.getElementById('linkUser').onclick = function () {
    router.redirect('/user/' + random.number(1, 100) + '/?a=1');
};
document.getElementById('linkPage1').onclick = function () {
    router.redirect('/page1?a=' + random.number(1, 100));
};
document.getElementById('linkPage2').onclick = function () {
    router.redirect('/page2?b=' + random.number(1, 100));
};
document.getElementById('linkPage3').onclick = function () {
    router.redirect('/page3/?c=' + random.number(1, 100));
};
document.getElementById('linkPage4').onclick = function () {
    router.redirect('/page4/?d=' + random.number(1, 100));
};

router.start();
