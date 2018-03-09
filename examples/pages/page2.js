define(function (require, exports, module) {
    var publicHTML = require('./public.html', 'html');
    var Alert = require('blear.ui.alert');
    var alert;

    exports.enter = function (view, route) {
        alert = new Alert({
            message: '不要离开我，你还有未完的事情需要处理。O(∩_∩)O~',
            sure: {
                text: '爱过'
            }
        });
        var style = '.page-2{background:#ffc;}';
        view.html('<div class="page page-2"><h1>page2 query.r=' + route.query.r + '</h1>' + publicHTML + '</div>');
        view.style(style);
    };
    exports.update = function (view, route) {
        view.html('<div class="page page-2"><h1>page2 query.r=' + route.query.r + '</h1>' + publicHTML + '</div>');
    };
    exports.hide = function (view, route, next) {
        console.log('<page2>', '[leave]', route);

        setTimeout(function () {
            var can = Math.random() > 0.5;

            if (can) {
                route.send({
                    now: Date.now()
                });
            } else {
                alert.open();
            }

            next(can);
        }, 2000);
    };

    exports.destroy = function (view, route, next) {
        alert.destroy(next);
    };
});