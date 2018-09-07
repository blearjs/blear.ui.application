define(function (require, exports, module) {
    exports.install = function (view, route) {
        var style = '.page-2{background:#ffc;}';
        view.style(style);
    };
    exports.update = function (view, route) {
        view.html('<div class="page page-2"><h1>page2 query.b=' + route.query.b + '</h1></div>');
    };
    exports.hide = function (view, route) {
        console.log('<page2>', '[leave]', route);
    };
});