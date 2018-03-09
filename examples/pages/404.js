define(function (require, exports, module) {
    exports.install = function (view, route) {
        var style = '' +
            '__self__ {' +
            /****/'background: #fcc;' +
            '}' +
            '.page-404 {' +
            /****/'font-size: 100px;' +
            '}' +
            '';
        view.html('<div class="page page-404"><h1>page 404 path:' + route.path + '</h1></div>');
        view.style(style);
    };
    exports.update = function (view, route) {
        view.html('<div class="page page-404"><h1>page 404 path:' + route.path + '</h1></div>');
    };
    exports.hide = function (view, route, nextRoute) {
        console.log('<404>', '[leave]', route);
        console.log('<404>', '[enter]', nextRoute);
    };
    exports.title = '404';
});