#iQuery

### 【概述】

**iQuery** 是一个**普适**而**轻巧**的 **DOM/JavaScript 开发库** —— **支持 IE 8+ 的 jQuery 兼容 API**，包含 最常用的 jQuery 静态/实例 属性、方法，适合替代逻辑简单的网页中体积很大的 jQuery，或作为“**Web 前端开发基础库**”嵌入各种 独立发布（不能有外部依赖、自闭合、有兼容性要求）的 JavaScript 库。

【注】对 IE 的兼容仅限其“标准模式”，而非“兼容性视图”。

### 【教程】

1. 基础知识 ——《[jQuery API 文档](http://www.jquery123.com/api/)》
2. 独立使用 ——（HTML 源码基本结构示例如下）
```
<!DocType HTML>
<html><head>
    <meta http-equiv="X-UA-Compatible" content="IE=Edge, Chrome=1" />
    <script src="path/to/iQuery.js"></script>
</head><body>
    ...
</body></html>
```
3. 嵌入使用 ——（典型应用实例项目如下）
> 文件级**前端脚本加载器** [EasyImport.js](http://git.oschina.net/Tech_Query/EasyImport.js)