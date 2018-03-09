define(function (require, exports, module) {
    exports.install = function (view, route) {
        var style = '.page-1{background:#cfc;}';
        view.style(style);
    };
    exports.update = function (view, route) {
        view.html('<div class="page page-1"><h1>page1 userId = ' + route.params.userId + '</h1></div>');
    };
    exports.hide = function (view, route) {
        console.log('<page1>', '[leave]', route);
    };
});