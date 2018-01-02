define(['../../polyfill/ES_API'],  function ($) {

    $ = $ || { };

    /**
     * 类数组对象
     *
     * @typedef {Array|NodeList|HTMLCollection|jQuery|$} ArrayLike
     */

    /**
     * 类数组对象 检测
     *
     * @author   TechQuery
     *
     * @memberof $
     *
     * @param    {object}  object
     *
     * @returns  {boolean}
     *
     * @example  // 字符串元素不可变，故不是类数组
     *
     *     $.likeArray(new String(''))    //  false
     *
     * @example  // 有 length 属性、但没有对应数量元素的，不是类数组
     *
     *     $.likeArray({0: 'a', length: 2})    //  false
     *
     * @example  // NodeList、HTMLCollection、jQuery 等是类数组
     *
     *     $.likeArray( document.head.childNodes )    //  true
     *
     * @example  // Node 及其子类不是类数组
     *
     *     $.likeArray( document.createTextNode('') )    //  false
     */

    $.likeArray = function (object) {

        if ((! object)  ||  (typeof object !== 'object'))
            return false;

        object = (typeof object.valueOf === 'function')  ?
            object.valueOf() : object;

        return Boolean(
            object  &&
            (typeof object !== 'string')  &&
            (typeof object.length === 'number')  &&  (
                object.length  ?
                    ((object.length - 1)  in  object)  :
                    !(object instanceof Node)
            )
        );
    };

    /**
     * 生成集合对象
     *
     * @author   TechQuery
     *
     * @memberof $
     *
     * @param    {(...string|string[])} array      - Keys of Set
     * @param    {function}             [callback] - Callback for items
     *
     * @returns  {object}               Set object (Not the one in ES 6)
     */

    $.makeSet = function (array, callback) {

        var iArgs = arguments,  iValue = true,  iSet = { };

        if (this.likeArray( callback )) {

            iValue = array;

            iArgs = callback;

        } else if (this.likeArray( array )) {

            iValue = callback;

            iArgs = array;
        }

        for (var i = 0;  i < iArgs.length;  i++)
            iSet[ iArgs[i] ] = (typeof iValue != 'function')  ?
                iValue  :  iValue(iArgs[i], i, iArgs);

        return iSet;
    };

    var WindowType = $.makeSet('Window', 'DOMWindow', 'global');

    /**
     * 检测对象类名
     *
     * @author   TechQuery
     *
     * @memberof $
     *
     * @param    {*}       object
     *
     * @returns  {string}  Class Name of the first argument
     */

    $.Type = function (object) {
        try {
            var iType = Object.prototype.toString.call( object ).slice(8, -1);

            var iName = object.constructor.name;

            iName = (typeof iName == 'function')  ?
                iName.call( object.constructor )  :  iName;

            if ((iType == 'Object')  &&  iName)  iType = iName;
        } catch (iError) {
            return 'Window';
        }

        if (! object)
            return  (isNaN(object)  &&  (object !== object))  ?  'NaN'  :  iType;

        if (WindowType[iType] || (
            (object == object.document)  &&  (object.document != object)
            //  IE 9- Hack
        ))
            return 'Window';

        if (object.location  &&  (object.location === (
            object.defaultView || object.parentWindow || { }
        ).location))
            return 'Document';

        if (
            iType.match(/HTML\w+?Element$/) ||
            (typeof object.tagName == 'string')
        )
            return 'HTMLElement';

        if (this.likeArray( object )) {
            iType = 'Array';
            try {
                object.item();
                try {
                    object.namedItem();

                    return 'HTMLCollection';

                } catch (iError) {

                    return 'NodeList';
                }
            } catch (iError) { }
        }

        return iType;
    };

    /**
     * 值相等 检测
     *
     * @author TechQuery
     *
     * @memberof $
     *
     * @param  {*}       left
     * @param  {*}       right
     * @param  {number}  [depth=1]
     *
     * @return {boolean}
     *
     * @example  // 基本类型比较
     *
     *     $.isEqual(1, 1)    //  true
     *
     * @example  // 引用类型（浅）
     *
     *     $.isEqual({a: 1},  {a: 1})    // true
     *
     * @example  // 引用类型（深）
     *
     *     $.isEqual({a: 1, b: {c: 2}},  {a: 1, b: {c: 2}},  2)    // true
     */

    $.isEqual = function isEqual(left, right, depth) {

        depth = depth || 1;

        if (!  (left && right))
            return  (left === right);

        left = left.valueOf();  right = right.valueOf();

        if ((typeof left != 'object')  ||  (typeof right != 'object'))
            return  (left === right);

        var Left_Key = Object.keys( left ),
            Right_Key = Object.keys( right );

        if (Left_Key.length != Right_Key.length)  return false;

        Left_Key.sort();  Right_Key.sort();  --depth;

        for (var i = 0, _Key_;  i < Left_Key.length;  i++) {

            _Key_ = Left_Key[i];

            if (_Key_ != Right_Key[i])  return false;

            if (! depth) {
                if (left[_Key_] !== right[_Key_])  return false;
            } else {
                if (! isEqual.call(
                    this, left[_Key_], right[_Key_], depth
                ))
                    return false;
            }
        }
        return true;
    };

    $.trace = function (iObject, iName, iCount, iCallback) {

        if (iCount instanceof Function)  iCallback = iCount;

        iCount = parseInt( iCount );

        iCount = isNaN( iCount )  ?  Infinity  :  iCount;

        var iResult = [ ];

        for (
            var _Next_,  i = 0,  j = 0;
            iObject[iName]  &&  (j < iCount);
            iObject = _Next_,  i++
        ) {
            _Next_ = iObject[iName];
            if (
                (typeof iCallback != 'function')  ||
                (iCallback.call(_Next_, i, _Next_)  !==  false)
            )
                iResult[j++] = _Next_;
        }

        return iResult;
    };

    /**
     * ES 6 迭代器协议
     *
     * @interface Iterator
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol|Iterator Protocol}
     */
    /**
     * @memberof Iterator
     * @instance
     * @function next
     */

    /**
     * 生成迭代器
     *
     * @author   TechQuery
     *
     * @memberof $
     *
     * @param    {Array}    array
     *
     * @returns  {Iterator}
     */

    $.makeIterator = function (array) {

        var nextIndex = 0;

        return {
            next:    function () {

                return  (nextIndex >= array.length)  ?
                    {done: true}  :  {done: false,  value: array[nextIndex++]};
            }
        };
    };

    return $;

});
