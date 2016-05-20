# blear.ui.application

[![npm module][npm-img]][npm-url]
[![build status][travis-img]][travis-url]
[![coverage][coveralls-img]][coveralls-url]

[travis-img]: https://img.shields.io/travis/blearjs/blear.ui.application/master.svg?maxAge=2592000&style=flat-square
[travis-url]: https://travis-ci.org/blearjs/blear.ui.application

[npm-img]: https://img.shields.io/npm/v/blear.ui.application.svg?maxAge=2592000&style=flat-square
[npm-url]: https://www.npmjs.com/package/blear.ui.application

[coveralls-img]: https://img.shields.io/coveralls/blearjs/blear.ui.application/master.svg?maxAge=2592000&style=flat-square
[coveralls-url]: https://coveralls.io/github/blearjs/blear.ui.application?branch=master



## 单页面结构
```
<views>
 <view>页面1</view>
 <view>页面2</view>
</views>
```
在路由切换页面的时候，会自动管理 view，然后将合适的 view 进行渲染，
然后再通知 controller，一个完整的过程是：

```
路由变化 => App => 创建 view => controller
```

## 控制器
每个控制器都必须遵守以下约定：
- `.enter(view, route, [next])`：控制器进入的时候做的事情，当新的 view 被创建时会执行该方法
- `.update(view, route, [next])`：路由更新时，更新 view 时会执行该方法
- `.leave(view, route, [next])`：路由离开时，此时可以`next(false)`阻止路由变化
- `.destroy(view, route, [next])`：当视图被销毁时做的事情
- `.title: String`：表示当前 view 的标题，否则以 app 标题为准

