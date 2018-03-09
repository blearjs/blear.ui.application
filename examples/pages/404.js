define(function (require, exports, module) {
    var publicHTML = require('./public.html', 'html');

    exports.install = function (view, route) {
        var style = '.page-404{background:#fcc;}';
        view.html('<div class="page page-404"><h1>page 404 path:' + route.path + '</h1>' + publicHTML + '</div>');
        view.style(style);
    };
    exports.update = function (view, route) {
        view.html('<div class="page page-404"><h1>page 404 path:' + route.path + '</h1>' + publicHTML + '</div>');
    };
    exports.hide = function (view, route) {
        console.log('<404>', '[leave]', route);
    };
    exports.title = '404';
});