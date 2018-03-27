define(function (require, exports, module) {
    exports.title = 'page1';
    exports.install = function (view, route) {
        var style = '.page-1{background:#cfc;}';
        view.style(style);
    };
    exports.update = function (view, route) {
        view.html('<div class="page page-1">' +
            '<h1>page1 userId = ' + route.params.userId + '</h1>' +
            '<img src="http://img02.tooopen.com/Downs/images/2010/8/1/sy_20100801111158104065.jpg">' +
            '</div>');
    };
    exports.hide = function (view, route) {
        console.log('<page1>', '[leave]', route);
    };
});