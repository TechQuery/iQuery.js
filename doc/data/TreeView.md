# TreeView


## 【基本信息】
 - 父类：[CommonView](CommonView.md)
 - 别名：`$.TreeView`


## 【实例属性】

### .length
 - 类型：Number
 - 含义：树形视图的深度（数字序号 索引的是一个个数组，内含对应深度上的 [ListView 对象](ListView.md)）

### .$_View
 - 类型：jQuery
 - 含义：与 TreeView 实例关联的 **视图容器** DOM 元素


## 【实例方法】

### .on(ConditionN, iCallback)
（继承自 [Observer](Observer.md)）

### .off(ConditionN, iCallback)
（继承自 [Observer](Observer.md)）

### .one(ConditionN, iCallback)
（继承自 [Observer](Observer.md)）

### .render(iData)
 - 用途：渲染一个树形数据结构
 - 参数
   - `iData` 渲染用的数据数组
 - 返回值：TreeView 对象

### .clear()
 - 用途：清空该树
 - 返回值：TreeView 对象

### .valueOf()
 - 用途：取出该树的原始数据
 - 返回值：Array