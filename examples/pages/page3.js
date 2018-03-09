define(function (require, exports, module) {
    var publicHTML = require('./public.html', 'html');

    exports.enter = function (app, route) {
        var style = '.page-3{background:#ccf;}';
        app.html('<div class="page page-3"><h1>page3 query.s=' + route.query.s + '</h1>' + publicHTML + '</div>');
        app.style(style);
    };
    exports.update = function (app, route) {
        app.html('<div class="page page-3"><h1>page3 query.s=' + route.query.s + '</h1>' + publicHTML + '</div>');
    };
    exports.hide = function (app, route) {
        console.log('<page3>', '[leave]', route);
    };
});