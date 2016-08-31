# iQuery


[**iQuery**](http://tech_query.oschina.io/iquery) 是一个 **普适**而 **轻巧**的 **DOM/JavaScript 开发库** —— **支持 IE 8+ 的 jQuery/W3C 兼容 API**，包含 最常用的 jQuery 静态/实例 属性、方法，适合替代逻辑简单的网页中体积很大的 jQuery，或作为 **Web 前端开发基础库** 嵌入各种 独立发布（不能有外部依赖、自闭合、有兼容性要求）的 JavaScript 库。

若 Zepto 相当于 jQuery v2.x 的精简版，那 iQuery 就相当于 **jQuery v1.x 的精简版**；而且 iQuery 在与 Zepto 接近的 **Minimized 体积**中提供了 IE 8/9 的兼容、 **更贴近官方的 jQuery 对象实现** 以及 **更多的实用扩展**（1300+ 行，超三分之一的体量，详见下文）。

在 API 形态上尽力兼容 jQuery 的同时，iQuery 在内部实现上采取 **“面向未来，向前兼容”的 Polyfill 策略** —— 核心逻辑（3000+ 行）尽力基于 **W3C、ECMA 最新标准中的优秀 API**，老旧浏览器兼容代码（部分基于 jQuery API，500+ 行）尽力包装成与新 API 相同的形式（原型拓展），并独立为外部模块。这样做不但能复用 jQuery API 来高效实现，还方便开发人员自行裁剪。

【注】对 IE 的兼容仅限其“标准模式”，而非“兼容性视图”。


## 【入门】

1. 基础知识 ——《[jQuery API 文档](http://www.jquery123.com/api/)》
2. 嵌入使用 —— 典型应用实例项目：文件级 **前端脚本加载器** [EasyImport.js](http://git.oschina.net/Tech_Query/EasyImport.js)
3. 独立使用 ——（HTML 源码基本结构示例如下）

```html
<!DocType HTML>
<html><head>
    <meta http-equiv="X-UA-Compatible" content="IE=Edge, Chrome=1" />
    <script src="path/to/iQuery.js"></script>
</head><body>
    ...
</body></html>
```
### 成功驱动的项目
 1. EasyImport.js
 2. 某公司 JS-SDK
 3. [EasyWebUI](http://git.oschina.net/Tech_Query/EasyWebUI/)
 4. [EasyWebApp](http://git.oschina.net/Tech_Query/EasyWebApp/)
 5. [jQuery-QRcode](https://larsjung.de/jquery-qrcode/)
 6. [EasyWiki](http://git.oschina.net/Tech_Query/EasyWiki/)
 7. 某公司 开放平台、业务后台
 8. 某公司 微信轻应用
 9. 某公司 WiFi 认证微官网


## 【API 总览】

### 对 jQuery（最新版）的增强

以下扩展已收录在本项目的 [**jQuery+.js**](/master/jQuery+.js) 中，方便配合其它 jQuery API 实现 ——
 - 内置一个改进且向下兼容的 **$.browser 对象**，能通过 **直接比较版本号**来区分浏览器
 - 新增 **计时相关方法（秒基准）**—— `$.every()`、`$.wait()`、`$.start()`、`$.end()`
 - 新增 **唯一串号生成器** —— `$.uuid()`
 - 新增 **类数组对象**判断方法 —— `$.likeArray()`
 - `$.unique()` 方法不局限于 DOM 元素数组
 - 新增 **对象值相等**判断方法 —— `$.isEqual()`
 - 新增 **集合对象**（可用于 in 操作符）生成方法 —— `$.makeSet()`
 - 新增 **对象链回溯**方法 —— `$.trace()`
 - 新增 **数组/对象交集方法** —— `$.intersect()`
 - 新增 **纯数据类型**判断方法 —— `$.isData()`
 - 新增 **对象构造函数名**获取方法 —— `$.Type()`
 - 新增 **字符串部分分割**方法 —— `$.split()`（借鉴 PHP）
 - 新增 **字符串字节长度**方法 —— `$.byteLength()`
 - 新增 **URL 参数对象化**方法（$.param() 的逆方法）—— `$.paramJSON()`，其返回值自带的 .toString() 有 **JSON 格式化（美化）输出**能力
 - 新增 **URL 参数签名**方法 —— `$.paramSign()`
 - 新增 **多条件观察者**基础对象 —— `$.Observer()`
 - 更智能的 `$.get()`、`$.post()`：支持 form 元素、FormData 对象的请求数据形式，整合 XHR、XDR、JSONP、iframe **自适应 跨域请求**， **自动转换响应内容**为 HTML、XML 或 JSON 对象实例
 - 新增 `$.delete()`、`$.put()`，方便实现基于 **RESTful API** 的单页应用
 - 新增 **URL 信息提取**方法 —— `$.fileName()`、`$.filePath()`、`$.urlDomain()`
 - 封装了 **表单元素无刷新提交**，并可直接绑定响应回调 —— `$.fn.ajaxSubmit()`（基于前述的几个 **AJAX 增强方法** 构建）
 - 新增 **选择符合法性判断**方法 —— `$.isSelector()`
 - 更多 jQuery **伪类选择符**：
   - **:image** 还支持 `img, link[type="image/x-icon"], svg, canvas` 及设置了 `background-image` 的普通元素
   - **:button** 还支持 `input[type="submit"], input[type="reset"], input[type="image"]`
   - 自带 **:focusable 伪类**（[jQuery UI](http://api.jqueryui.com/) 标准）
   - 自带 **:data() 伪类**（[jQuery UI](http://api.jqueryui.com/) 标准）
   - 新增 **:list 伪类**，等价于 `ul, ol, dl, tbody, select, datalist`
   - 新增 **:media 伪类**，等价于 `iframe, object, embed, audio, video` 及尺寸较大的 `:image`
 - 新增 **子元素插入**方法 —— `$.fn.insertTo()`
 - 新增 **祖先元素交集**方法 —— `$.fn.sameParents()`
 - 新增 **有滚动条的祖先元素**方法 —— `$.fn.scrollParents()`
 - 新增 **元素可视口检测**方法 —— `$.fn.inViewport()`
 - 新增 **元素平滑滚动**方法 —— `$.fn.scrollTo()`
 - 所有类型的 **DOM 信息读写器**（`.attr()`、`.prop()`、`.css()`、`.data()`）均支持“不传键名时返回 **信息全集**”特性
 - 新增 **DOM 数据归并**方法 —— `$.fn.reduce()`
 - 新增 **DOM 可见内容读写**方法 —— `$.fn.value()`，智能存取多种类型的值
 - .css() 取值时，会把 纯数字值、像素值 直接返回为 Number 类型
 - .css() 赋值一律默认 important 优先级，确保赋值的有效性
 - `$.fn.show()` 兼容 **元素非固有 display 属性值**，避免破坏 复杂布局
 - 新增 **DOM 元素 z-index 集成**方法 —— `$.fn.zIndex()`，集 **取实际值、赋值、同辈置顶/沉底** 功能于一身
 - 新增 **CSS 规则全局设置**方法 —— `$.cssRule()`
 - 新增 **DOM 元素 CSS 规则读写**方法 —— `$.fn.cssRule()`
 - 新增 **DOM 选中内容读写**方法 —— `$.fn.selection()`
 - `$.fn.focus()` 会让所有可见元素获得焦点
 - 统一 **mousewheel 事件**，并新增其快捷方法
 - 封装了 **触屏单指手势事件**（tap、press、swipe），并为桌面端、移动端提供一致的操作体验
 - 新增 **跨页面消息事件**方法 —— `$.fn.onReply()`（基于 `window.postMessage()`）


### 未实现的 jQuery（最新版）特性

 - 没有 $.noConflict()，但不会强占 jQuery 变量
 - 不支持 浏览器 **内置类型**（构造函数）相应的 $.isXXX() 系列方法
 - 不支持 **浏览器特性检测**
 - 不支持 $.ajax() 不常用的自定义选项
 - 不支持 $.Deferred()
 - **jQuery 扩展伪类选择符**：只支持 常用且“难以用 **CSS 标准选择符** 或 jQuery API 实现其功能”的
 - 不支持 **XPath 选择器**、操作 **XML 文档**
 - 不支持一些不常用的 **jQuery 静态/实例方法**
 - 暂不支持 **动画队列**


### ECMA、W3C 标准 API 补丁

 - 自带 支持“非空白符”的 `String.prototype.trim()`（借鉴 PHP）
 - 新增 `String.prototype.repeat` 标准草案方法
 - 新增 String **toCamelCase**（驼峰命名法）、 **toHyphenCase**（连字符命名法） **书写格式转换**方法
 - 自带 `Array.prototype.indexOf()` 标准方法
 - 自带 `Array.prototype.reduce()` 标准方法
 - 自带 `Function.prototype.name` 属性补丁
 - 自带 `Object.getOwnPropertyNames()` 标准方法
 - 自带 `Date.now()` 标准方法
 - 新增 JSON **format 格式化显示**方法、 **parseAll 深度解析**方法（$.parseJSON() 被其增强）
 - 自带 `Promise()` 标准对象构造函数
 - 重写 `Error.prototype.valueOf()`，使 IE 10- 返回可查询的错误码（附带 官方文档 URL）
 - 新增 **DOMHttpRequest 对象**，封装了 **JSONP Get**、 **iframe Post**
 - 自带 `HTMLDocument.prototype.currentScript` 属性
 - 自带 `Element.prototype.textContent` 属性
 - 自带 `Element.prototype.innerHTML` 的 IE 8 补丁
 - 自带 **HTMLCollection 对象**，修复 IE 10- `Element.prototype.children` 属性在其元素有 name 属性时的“数字键值缺失”Bug
 - 自带 Element 对象的 `firstElementChild`、`lastElementChild`、`previousElementSibling`、`nextElementSibling` 属性
 - 自带 `Element.prototype.matches` 标准草案方法
 - 自带 **DOMTokenList 对象**，为 IE 10- 提供 **classList** 支持
 - 自带 **DOMStringMap 对象**，为 IE 11- 提供 **dataset** 支持
 - 自带 `HTMLSelectElement.prototype.selectedOptions` 属性的 IE 补丁
 - 修正 IE 8 DOM Attribute 系列方法对 JavaScript 关键字的特殊处理
 - 自带 **CSSStyleDeclaration 对象**，为 IE 8 提供 **getComputedStyle** 支持，并封装了 M$ DirectX 滤镜属性转换
 - 自带 Google Chrome **元素 CSS 规则对象 获取**方法 `Window.getMatchedCSSRules()`
 - 自带 **HTML 5 Form API**，为 IE 10-、iOS WebKit 提供兼容支持
 - 自带 **FormData 构造函数**，为 IE 10- 提供 表单数据封装
 - 自带 DOMParser 对象，为 IE 8 提供 **XML 文档解析**支持


## 【iQuery+ 插件库】

 - 通用 **CommonView 对象**生成方法 —— `$.CommonView()`
 - 通用 **ListView 对象**生成方法 —— `$.ListView()`
 - 通用 **TreeView 对象**生成方法 —— `$.TreeView()`
 - **HTML 5  History API  Polyfill** —— 为 IE 10- 提供兼容支持（需 服务器端响应 `./blank.html` 或 404 页面）
 - Base64 文本转 **二进制对象**方法 —— `$.toBlob()`
 - 基于 **现代浏览器 Crypto API** 的哈希方法 —— `$.dataHash()`


## 【参与开发】

### 环境搭建
 1. 安装 **Git**（比 SVN 更适合 **开源团队**）
 2. 安装 **Node.JS** 最新 LTS 版

### 从源码构建

UNIX-Shell、Windows-CMD 通用脚本 ——

```Shell
npm install -g requirejs
npm install -g uglify-js

mkdir ./iQuery
git clone https://git.oschina.net/Tech_Query/iQuery.git ./iQuery

node r.js -o build/source.js
uglifyjs iQuery.js -c -m -o iQuery.min.js --source-map=iQuery.min.map
```