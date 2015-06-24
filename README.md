#iQuery

### 【概述】

**iQuery** 是一个**普适**而**轻巧**的 **DOM/JavaScript 开发库** —— **支持 IE 8+ 的 jQuery 兼容 API**，包含 最常用的 jQuery 静态/实例 属性、方法，适合替代逻辑简单的网页中体积很大的 jQuery，或作为“**Web 前端开发基础库**”嵌入各种 独立发布（不能有外部依赖、自闭合、有兼容性要求）的 JavaScript 库。

若 Zepto 相当于 jQuery v2.x 的精简版，那 iQuery 就相当于 **jQuery v1.x 的精简版**。

【注】对 IE 的兼容仅限其“标准模式”，而非“兼容性视图”。

### 【入门】

1. 基础知识 ——《[jQuery API 文档](http://www.jquery123.com/api/)》
2. 嵌入使用 —— 典型应用实例项目：文件级**前端脚本加载器** [EasyImport.js](http://git.oschina.net/Tech_Query/EasyImport.js)
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

### 【对 jQuery（最新版）的增强】
- 内置一个改进且向下兼容的 **$.browser 对象**，能通过**直接比较版本号**来区分浏览器
- 新增 **计时相关方法（秒基准）**—— $.every()、$.wait()、$.start()、$.end()
- 新增 **纯数据类型判断方法** —— $.isData()
- $.trim() 可**去除指定的非空白符**（借鉴 PHP）
- 新增 **URL 参数对象化方法**（$.param() 的逆方法）—— $.paramJSON()，其返回值自带的 .toString() 有 **JSON 格式化（美化）输出**能力
- 新增 **唯一串号生成器** —— $.uid()
- 更智能的 $.get()、$.post()：自动 发起跨域请求、转换响应内容为 JSON 或 XML
- 新增 **表单无刷新提交方法** —— $.fn.post()（基于 iframe，可无需服务器支持即可**跨域提交**）
- 新增基于**现代浏览器 Crypto API** 的哈希方法 —— $.dataHash()
- jQuery :button **伪类选择符** 还支持 submit、reset、image 类型的按钮
- .attr()、.data() 有与 .css() 一致的“**数组取值为对象、对象批量赋值**”能力
- .css() 封装了老版 IE 的 CSS Filter
- .css() 取值时，会把 纯数字值、像素值 直接返回为 Number 类型
- .css() 赋值一律默认 important 优先级，确保赋值的有效性
- 新增 **DOM 元素 z-index 集成方法** —— $.fn.zIndex()，集“**取实际值、赋值、同辈置顶/沉底**”功能于一身
- 新增 **.cssRule() 静态/实例方法**，便于就近声明 DOM 元素的 CSS 规则
- 新增 **伪类/元素 CSS 规则对象 提取方法** —— $.cssPseudo()
- 新增 **选择符合法性判断方法** —— $.is_Selector()
- 新增 **DOM 元素集合父元素交集方法** —— $.sameParents()
- 封装 **Animate.css** 为 $.fn.cssAnimate()，其调用参数 兼容 $.fn.animate()
- 封装了**触屏手势事件**，为桌面端、移动端提供一致的操作体验

### 【未实现的 jQuery（最新版）特性】
- **jQuery 扩展伪类选择符**：只支持 常用且“难以用 **CSS 标准选择符** 或 jQuery API 实现其功能”的 —— :visible、:button、:header、:input
- 构造 DOM 元素时的第二参数中不能调用与键名同名的实例方法，仅能设置 DOM 属性
- 没有 $.noConflict()（但不会占用 jQuery 变量）
- 不支持 浏览器**内置类型**（构造函数）相应的 $.isXXX() 方法（但 $.type() 均能返回与构造函数名一致的“类型名”）
- 暂不支持 $.ajax() 及相关的各种自定义选项
- 不支持 $.Deferred()（正在尝试引入 ECMAScript 6 的 Promise 对象）
- 不支持一些不常用的 **jQuery 静态/实例方法**
- **事件冒泡** 完全依赖 **浏览器自身实现**，不做抽象统一
- 暂不支持 **动画队列**、**速度曲线函数**

### 【协作开发】

本项目提炼于其发起人的**日常开发实战**，其本人会**持续更新**，同时欢迎广大 **Web 开发爱好者**在 **OSChina 社区**与其交流、提交 **Pull Request**！~