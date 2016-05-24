define(function (require, exports, module) {
    var publicHTML = require('./public.html', 'html');

    exports.enter = function (app, route) {
        var style = '.page-1{background:#cfc;}';
        app.html('<div class="page page-1"><h1>page1 userId = ' + route.params.userId + '</h1>' + publicHTML + '</div>');
        app.style(style);
    };
    exports.update = function (app, route) {
        app.html('<div class="page page-1"><h1>page1 userId = ' + route.params.userId + '</h1>' + publicHTML + '</div>');
    };
    exports.leave = function (app, route, next) {
        console.log('<page1>', '[leave]', route);
        setTimeout(function () {
            next(true);
        }, 1000);
    };
});