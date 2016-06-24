# CommonView


## 【基本信息】
 - 父类：[Observer](Observer.md)
 - 别名：`$.CommonView`


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