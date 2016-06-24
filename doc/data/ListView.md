# ListView


## 【基本信息】
 - 父类：[CommonView](CommonView.md)
 - 别名：`$.ListView`


## 【静态方法】

### findView($_Root, Init_Instance)
 - 用途：查找“列表式”结构的 DOM 元素
 - 参数
   - `$_Root` 查找的根节点
     - 支持 jQuery 选择符、DOM 元素节点、DOM 元素集合
   - `Init_Instance`（可选）
     - `true` 用 ListView 实例化找到的元素
     - `false` 清除所找元素关联的 ListView 实例
 - 返回值：jQuery 对象

## 【实例属性】

### .length
 - 类型：Number
 - 含义：列表项目总数

### .$_View
 - 类型：jQuery
 - 含义：与 ListView 实例关联的 **视图容器** DOM 元素


## 【实例方法】

### .on(ConditionN, iCallback)
（继承自 [Observer](Observer.md)）

### .off(ConditionN, iCallback)
（继承自 [Observer](Observer.md)）

### .one(ConditionN, iCallback)
（继承自 [Observer](Observer.md)）

### .insert(iValue, Index)
 - 用途：插入一个列表项
 - 参数
   - `iValue` 渲染用的数据值
   - `Index`（可选）插入点的索引号
 - 返回值：jQuery 对象

### .render(iData, iFrom)
 - 用途：插入一批列表项
 - 参数
   - `iData` 渲染用的数据数组
   - `iFrom`（可选）插入点的索引号
 - 返回值：ListView 对象

### .valueOf(Index)
 - 用途：取出一个列表项的原始数据值
 - 参数
   - `Index`（可选）列表项的索引号
 - 返回值：Array（无参数）或 任意类型（具体某项的数据） 

### .remove(Index)
 - 用途：删除一个列表项
 - 参数
   - `Index` 列表项的 索引号 或 其本身
 - 返回值：ListView 对象

### .clear()
 - 用途：清空列表项
 - 参数
 - 返回值：ListView 对象

### .focus(Index)
 - 用途：把一个列表项 滚动到 **可视区域**
 - 参数
   - `Index` 列表项的索引号
 - 返回值：ListView 对象

### .sort(iCallback)
 - 用途：重排本列表
 - 参数
   - `iCallback` 类数组排序回调
 - 返回值：ListView 对象