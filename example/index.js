/**
 * 文件描述
 * @author ydr.me
 * @create 2016-04-29 20:17
 */


define(function (require, exports, module) {
    /**
     * @module parent/application
     */

    'use strict';

    console.timeEnd('模块加载时间');

    var Application = require('../src/index.js');
    var Loading = require('blear.ui.loading');
    var UI = require('blear.ui');
    var random = require('blear.utils.random');
    var howdo = require('blear.utils.howdo');
    var Router = require('blear.classes.router');
    var Animation = require('blear.classes.animation');
    var attribute = require('blear.core.attribute');
    var layout = require('blear.core.layout');

    var publicHTML = require('./pages/public.html', 'html');

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
        .match('/page2/', function (resolve) {
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

            exports.enter = function (app, meta) {
                console.log('<page4>', '[enter]', meta);
                var style = '.page-4{background:#ccc;}';
                app.html('<div class="page page-4"><h1>page 4 query.x=' + meta.query.x + '</h1>' + publicHTML + '</div>');
                app.style(style);
            };
            exports.update = function (app, meta) {
                console.log('<page4>', '[update]', meta);
                app.html('<div class="page page-4"><h1>page 4 query.x=' + meta.query.x + '</h1>' + publicHTML + '</div>');
            };
            exports.leave = function (app, meta) {
                console.log('<page4>', '[leave]', meta);
            };

            return exports;
        })
        .otherwise(function (resolve) {
            require.async('./pages/404.js', resolve);
        });

    var hideZindex = UI.zIndex();
    var showZindex = UI.zIndex();
    var app = window.app = new Application(router, {
        el: '#app',
        maxLength: 2,
        showAnimation: function (el, viewOptions, done) {
            var an = new Animation(el);
            var winH = layout.height(window);
            var from = {
                display: 'block'
            };
            var to;

            switch (viewOptions.direction) {
                case 'none':
                    from.transform = {
                        translateY: '100%'
                    };
                    from.opacity = 0;
                    to = {
                        transform: {
                            translateY: 0
                        },
                        opacity: 1
                    };
                    break;

                case 'forward':
                    from.transform = {
                        translateX: '100%'
                    };
                    from.zIndex = showZindex;
                    to = {
                        transform: {
                            translateX: 0
                        }
                    };
                    break;

                case 'back':
                    from.transform = {
                        translateX: '-10%'
                    };
                    from.zIndex = hideZindex;
                    to = {
                        transform: {
                            translateX: 0
                        }
                    };
                    break;
            }


            attribute.style(el, from);
            an.transit(to, {
                duration: 345
            });
            an.start(function () {
                attribute.style(el, {
                    transform: ''
                });
                done();
            });
            an.destroy();
        },
        hideAnimation: function (el, viewOptions, done) {
            var from = {
                transform: {
                    translateX: 0
                }
            };
            var to;

            switch (viewOptions.direction) {
                case 'forward':
                    from.zIndex = hideZindex;
                    to = {
                        transform: {
                            translateX: '-10%'
                        }
                    };
                    break;
                case 'back':
                    from.zIndex = showZindex;
                    to = {
                        transform: {
                            translateX: '100%'
                        }
                    };
                    break;
            }

            attribute.style(el, from);
            var an = new Animation(el);
            an.transit(to, {
                duration: 345
            });
            an.start(function () {
                attribute.hide(el);
                done();
            });
            an.destroy();
        }
    });

    app.on('beforeTransition', function (route) {
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
});