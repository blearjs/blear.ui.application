define(function (require, exports, module) {
    var publicHTML = require('./public.html', 'html');

    exports.enter = function (app, route) {
        var style = '.page-404{background:#fcc;}';
        app.html('<div class="page page-404"><h1>page 404 path:' + route.path + '</h1>' + publicHTML + '</div>');
        app.style(style);
    };
    exports.update = function (app, route) {
        app.html('<div class="page page-404"><h1>page 404 path:' + route.path + '</h1>' + publicHTML + '</div>');
    };
    exports.leave = function (app, route) {
        console.log('<404>', '[leave]', route);
    };
});