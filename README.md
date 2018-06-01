# iQuery

兼容 [jQuery API](http://api.jquery.com/) 的 DOM / AJAX 基础库，基于原创的 ECMA / W3C polyfill 构建，并内置很多常用的 jQuery 扩展 API。

[![Join the chat at https://gitter.im/iQuery-js/Lobby](https://badges.gitter.im/iQuery-js/Lobby.svg)](https://gitter.im/iQuery-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

在 API 形态上尽力兼容 jQuery 的同时，iQuery 在内部实现上采取 **“面向未来，向前兼容”的 Polyfill 策略** —— jQuery 标准 API（2500 行）、iQuery 扩展 API（1800 行）尽力基于 **W3C、ECMA 最新标准中的优秀 API**，老旧浏览器兼容代码（部分基于 jQuery API，1200+ 行）尽力包装成与新 API 相同的形式（原型拓展），并独立为外部模块。这样做不但能复用 jQuery API 来高效实现，还方便开发人员自行裁剪。

【注】对 IE 的兼容仅限其“标准模式”，而非“兼容性视图”。



## 【竞品比较】

|                     | iQuery | jQuery                      | Zepto   | JSLite  |
|:-------------------:|:------:|:---------------------------:|:-------:|:-------:|
| 浏览器兼容            | IE 8+  | IE 6+ (v1.x)、IE 9+ (v2.0+) | IE 10+  | IE 10+  |
| ECMA / W3C polyfill | 多      | ×（各模块自行实现 Fix）       | 少       | 少      |
| 扩展 API             | 多      |                            | 少       | 少      |
| 触控事件              | 单指    | ×                          | 多指     | ×       |
| 源代码模块化           | AMD    | AMD                        | IIFE     | IIFE   |
| API 注解（JSDoc）     | √      | ×                          | ×        | ×       |
| 测试框架              | Mocha  | QUnit                      | Evidence | Mocha   |



## 【入门】

 1. 基础知识 ——《[jQuery API 文档](http://www.jquery123.com/)》

 2. HTML 源码基本结构

```html
<!DocType HTML>
<html><head>
    <meta http-equiv="X-UA-Compatible" content="IE=Edge, Chrome=1" />

    <!--  1. 独立使用  -->
    <script src="path/to/iQuery.min.js"></script>

    <!--  2. AMD 规范加载  -->
    <script src="https://cdn.bootcss.com/require.js/2.3.5/require.min.js"></script>
    <script>
        require.config({
            paths:    {
                iQuery:    'path/to/iQuery.min.js'
            }
        });
    </script>
</head><body>
    ...
</body></html>
```


## 【API 总览】

### 对 jQuery（最新版）的增强

以下扩展已收录在本项目的 [**jQueryKit.js**](/master/jQueryKit.js) 中，方便配合其它 jQuery API 实现 ——

[【API 文档】](https://techquery.github.io/iQuery.js/)及更多变更：

 - 内置一个改进且向下兼容的 **$.browser 对象**，能通过 **直接比较版本号**来区分浏览器
 - 新增 **计时相关方法（秒基准）**—— `$.every()`、`$.wait()`、`$.start()`、`$.end()`
 - `$.unique()` 方法不局限于 DOM 元素数组
 - 新增 **对象链回溯**方法 —— `$.trace()`
 - 新增 **对象补丁**方法 —— `$.patch()`
 - 新增 **字符串字节长度**方法 —— `$.byteLength()`
 - 新增 **函数柯里化**方法 —— `$.curry()`
 - 新增 **URL 信息提取**方法 —— `$.fileName()`、`$.filePath()`、`$.urlDomain()`
 - 新增 **URL 参数签名**方法 —— `$.paramSign()`
 - `$.parseJSON()` 支持 **递归解析**，会将 JSON 字符串中的内层字符串 eval 为 JS 实值/例
 - 新增 **JSON 格式化显示**方法 —— `$.formatJSON()`
 - 基于官方 `$.ajaxTransport()` 重载 **JSONP 实现**，支持基本的异常处理
 - `$.ajax()` 支持 form 元素、FormData 对象的请求数据形式，整合 XHR、XDR、JSONP、iframe **自适应 跨域请求**
 - `$.ajax()` **自动转换响应内容**为 HTML、XML 或 JSON 对象实例
 - 新增 `$.delete()`、`$.put()`，方便实现基于 **RESTful API** 的单页应用
 - 新增 `$.fn.htmlExec()` **W3C HTML 解析器**方法，并基于此重构 `$.fn.load()` 内部实现，方便 DOM 片段清理、脚本调试
 - 新增 **多媒体元素加载完成**方法 —— `$.fn.mediaReady()`
 - 封装了 **表单元素无刷新提交**，并可直接绑定响应回调 —— `$.fn.ajaxSubmit()`（基于前述的几个 **AJAX 增强方法** 构建）
 - 新增 **选择符合法性判断**方法 —— `$.isSelector()`
 - 更多 jQuery **伪类选择符**：
   - **:image** 还支持 `img, link[type="image/x-icon"], svg, canvas` 及设置了 `background-image` 的普通元素
   - **:button** 还支持 `input[type="submit"], input[type="reset"], input[type="image"]`
   - **:input** 还支持 contentEditable、designMode 属性
   - 自带 `:indeterminate`，属 [CSS 3 标准](https://developer.mozilla.org/zh-CN/docs/Web/CSS/:indeterminate)
   - 自带 `:focusable`，属 [jQuery UI 标准](http://www.css88.com/jquery-ui-api/focusable-selector/)
   - 自带 `:data()`，属 [jQuery UI 标准](http://www.css88.com/jquery-ui-api/data-selector/)
   - 自带 `:field`，匹配所有含 **可提交字段**的元素
   - 新增 `:list`，等价于 `ul, ol, dl, tbody, datalist`
   - 新增 `:media`，等价于 `:image, iframe, object, embed, audio, video`
   - 新增 `:loaded`，等价于 `img, audio, video`、`document` 加载结束
   - 新增 `:scrollable`，匹配所有 **内容可滚动**的元素
 - 新增 **祖先元素交集**方法 —— `$.fn.sameParents()`
 - 新增 **有滚动条的祖先元素**方法 —— `$.fn.scrollParents()`
 - 新增 **元素平滑滚动**方法 —— `$.fn.scrollTo()`
 - 所有类型的 **DOM 信息读写器**（`.attr()`、`.prop()`、`.css()`、`.data()`）均支持“不传键名时返回 **信息全集**”特性
 - 新增 **DOM 数据归并**方法 —— `$.fn.reduce()`
 - .css() 取值时，会把 纯数字值、像素值 直接返回为 Number 类型
 - .css() 赋值一律默认 important 优先级，确保赋值的有效性
 - `$.fn.show()` 兼容 **元素非固有 display 属性值**，避免破坏 复杂布局
 - 新增 **DOM 元素 z-index 集成**方法 —— `$.fn.zIndex()`，集 **取实际值、赋值、同辈置顶/沉底** 功能于一身
 - 新增 **CSS 选择符优先级计算**方法 —— `$.selectorPriority()`
 - 新增 **CSS 厂商命名获取**方法 —— `$.cssName()`
 - 新增 **CSS 集合对象搜索**方法 —— `$.searchCSS()`
 - 自带 **DOM 唯一 ID 设置**方法 —— `$.fn.uniqueId()`（[jQuery UI 标准](http://www.css88.com/jquery-ui-api/uniqueId/)）
 - 新增 **DOM 选中内容读写**方法 —— `$.fn.selection()`
 - `$.fn.focus()` 会让所有可见元素获得焦点
 - 新增 **被动观察者**对象 —— `$.Observer()`
 - 新增 `$.customEvent()` **事件扩展接口**，并基于此实现 `input` 标准事件的补丁
 - 封装了 **触屏单指手势事件**（tap、press、swipe），并为桌面端、移动端提供一致的操作体验
 - 新增 **用户操作空闲事件**方法 —— `$.fn.onIdleFor()`
 - 新增 **跨页面消息事件**方法 —— `$.fn.onReply()`（基于 `window.postMessage()`）
 - `$.fn.animate()` 支持类似 [jQuery UI `$.fn.effect()`](http://www.css88.com/jquery-ui-api/effect/) **动画效果名**参数（基于 **CSS Animation** 实现）
 - 新增 **CSS 动画类切换**方法 —— `$.fn.toggleAnimate()`
 - 新增 Base64 文本转 **二进制对象**方法 —— `$.toBlob()`
 - 新增 **数据哈希**方法 —— `$.dataHash()`
   - 默认算法：**CRC-32**
   - 还支持 **现代浏览器 Crypto API**


### 未实现的 jQuery（最新版）特性

 - 没有 $.noConflict()，但不会强占 jQuery 变量
 - 不支持 浏览器 **内置类型**（构造函数）相应的 $.isXXX() 系列方法
 - 不支持 **浏览器特性检测**
 - 不支持 $.ajax() 不常用的自定义选项
 - 不支持 $.Deferred()
 - **jQuery 扩展伪类选择符**：只支持 常用且“难以用 **CSS 标准选择符** 或 jQuery API 实现其功能”的
 - 不支持 **XPath 选择器**、操作 **XML 文档**
 - 不支持一些不常用的 **jQuery 静态/实例方法**
 - 不支持 **动画队列**外部操作 API


### ECMA、W3C 标准 API 补丁

 - 自带 `Number.isInteger()` 整数判断方法
 - 自带 `Number.isSafeInteger()` 安全整数判断方法
 - 自带 支持“非空白符”的 `String.prototype.trim()`（借鉴 PHP）
 - 自带 `String.prototype.repeat` 标准方法
 - 自带 `String.prototype.padStart` 标准方法
 - 自带 `String.prototype.padEnd` 标准方法
 - 自带 `Array.from()` 标准方法
 - 自带 `Array.prototype.indexOf()` 标准方法
 - 自带 `Array.prototype.reduce()` 标准方法
 - 自带 `Function.prototype.name` 属性补丁
 - 自带 `Object.keys()` 标准方法
 - 自带 `Object.getPrototypeOf()` 标准方法
 - 自带 `Object.create()` 标准方法
 - 自带 `Date.now()` 标准方法
 - 自带 `Promise()` 标准对象构造函数
 - 重写 `Error.prototype.valueOf()`，使 IE 10- 返回可查询的错误码（附带 官方文档 URL）
 - 新增 **HTMLHttpRequest 对象**，封装了 **JSONP Get**、 **iframe Post**
 - 自带 `HTMLDocument.prototype.currentScript` 属性
 - 自带 `HTMLDocument.prototype.scrollingElement` 属性
 - 自带 **ChildNode 接口**的 `remove()`、`replaceWith()` 实例方法
 - 自带 `Element.prototype.textContent` 属性
 - 自带 `Element.prototype.innerHTML` 的 IE 8 补丁
 - 自带 **HTMLCollection 对象**，修复 IE 10- `Element.prototype.children` 属性在其元素有 name 属性时的“数字键值缺失”Bug
 - 自带 Element 对象的 `firstElementChild`、`lastElementChild`、`previousElementSibling`、`nextElementSibling` 属性
 - 自带 `Element.prototype.matches` 标准草案方法
 - 自带 **DOMTokenList 对象**，为各种浏览器的 `<a />`、`<area />`、`<link />`、`<svg />` 等元素提供 **classList**、**relList** 属性支持
 - 自带 **DOMStringMap 对象**，为 IE 11- 提供 **dataset** 支持
 - 自带 `HTMLSelectElement.prototype.selectedOptions` 属性的 IE 补丁
 - 自带 `location.origin`、`HTMLAnchorElement.prototype.origin` 只读属性 IE 11- 补丁
 - 修正 IE 8 DOM Attribute 系列方法对 JavaScript 关键字的特殊处理
 - 自带 **CSSStyleDeclaration 对象**，为 IE 8 提供 **getComputedStyle** 支持，并封装了 M$ DirectX 滤镜属性转换
 - 自带 Mozilla Firefox **元素 CSS 默认规则对象 获取**方法 `Window.getMatchedCSSRules()`
 - 自带 Google Chrome **元素 CSS 匹配规则对象 获取**方法 `Window.getMatchedCSSRules()`
 - 自带 `FormData()` 标准对象构造函数，为 IE 10- 提供 表单数据封装
 - 自带 `DOMImplementation()` 标准对象 `createDocument`、`createHTMLDocment` 实例方法，为 IE 8 提供 **XML / HTML 文档对象创建**支持
 - 自带 `DOMParser()` 标准对象构造函数，为 IE 8+ 提供 **XML / SVG / HTML 文档代码解析**支持
 - 自带 `URL()` 标准对象构造函数
 - 自带 `URLSearchParams()` 标准对象构造函数
