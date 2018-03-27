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
        view.style(style);
    };
    exports.update = function (view, route) {
        view.html('<div class="page page-404"><h1>page 404 path:' + route.path + '</h1>' +
            '<div style="width:100px;height:100px;' +
            'background:url(http://192.168.12.112:5150/static/img/svg/home/invite.svg);' +
            '"></div>' +
            '<img src="http://img0.pclady.com.cn/pclady/pet/choice/cat/1701/6.jpg">' +
            '</div>');
    };
    exports.hide = function (view, route, nextRoute) {
        // console.log('<404>', '[leave]', route);
        // console.log('<404>', '[enter]', nextRoute);
    };
    exports.title = '404';
});