define(function (require, exports, module) {
    exports.install = function (view, route) {
        var style = '.page-3{background:#ccf;}';
        view.style(style);
    };
    exports.update = function (view, route) {
        view.html('<div class="page page-3"><h1>page3 query.c=' + route.query.c + '</h1></div>');
    };
    exports.hide = function (view, route) {
        console.log('<page3>', '[leave]', route);
    };
});