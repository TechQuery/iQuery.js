# Observer


## 【基本信息】
 - 别名：`$.Observer`


## 【实例方法】

### .on(ConditionN, iCallback)
 - 用途：新增一个长期事件监听
 - 参数
   - `ConditionN` 此处可以是 N 个 **监听条件**参数
   - `iCallback` 事件回调
 - 返回值：Observer 对象

### .off(ConditionN, iCallback)
 - 用途：移除一个事件监听
 - 参数
   - `ConditionN` 此处可以是 N 个 **监听条件**参数
   - `iCallback` 事件回调
 - 返回值：Observer 对象

### .one(ConditionN, iCallback)
 - 用途：新增一个一次性事件监听
 - 参数
   - `ConditionN` 此处可以是 N 个 **监听条件**参数
   - `iCallback` 事件回调
 - 返回值：Observer 对象

### .trigger(ConditionN, iData)
 - 用途：触发一个事件
 - 参数
   - `ConditionN` 此处可以是 N 个 **监听条件**参数
   - `iData` 事件回调的参数
 - 返回值：任意类型，其为最后一个有意义的 **事件回调返回值**