# CommonView


## 【基本信息】
 - 父类：[Observer](Observer.md)
 - 别名：`$.CommonView`


## 【静态方法】

### instanceOf(iDOM, Check_Parent)
 - 用途：获取一个 DOM 元素所属的 CommonView 实例
 - 参数
   - `iDOM` 一个 CommonView 对象的 DOM 子元素
   - `Check_Parent`（可选）可用 false 强制不查找祖先元素上的实例
 - 返回值：CommonView 对象


## 【实例属性】

### .$_View
 - 类型：jQuery
 - 含义：与 CommonView 实例关联的 **视图容器** DOM 元素


## 【实例方法】

### .on(ConditionN, iCallback)
（继承自 [Observer](Observer.md)）

### .off(ConditionN, iCallback)
（继承自 [Observer](Observer.md)）

### .one(ConditionN, iCallback)
（继承自 [Observer](Observer.md)）

### .trigger(ConditionN, iData)
（继承自 [Observer](Observer.md)）

### .render(iData)
 - 用途：渲染本视图
 - 参数
   - `iData` 渲染用的数据
 - 返回值：CommonView 对象

### .clear()
 - 用途：清空视图中的数据
 - 返回值：CommonView 对象