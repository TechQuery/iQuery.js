define(function () {

    /* ----- Object Patch ----- */

    if (! Object.keys)
        Object.keys = function (iObject) {
            var iKey = [ ];

            for (var _Key_ in iObject)
                if ( this.prototype.hasOwnProperty.call(iObject, _Key_) )
                    iKey.push(_Key_);

            return iKey;
        };

    Object.getPrototypeOf = Object.getPrototypeOf  ||  function (object) {

        if (! (object != null))
            throw TypeError('Cannot convert undefined or null to object');

        if ( object.__proto__ )  return object.__proto__;

        if (! object.hasOwnProperty('constructor'))
            return object.constructor.prototype;

        var constructor = object.constructor;

        delete object.constructor;

        var prototype = object.constructor.prototype;

        object.constructor = constructor;

        return prototype;
    };

    Object.create = Object.create  ||  function (iProto, iProperty) {

        if (typeof iProto != 'object')
            throw TypeError('Object prototype may only be an Object or null');

        function iTemp() { }

        iTemp.prototype = iProto;

        var iObject = new iTemp();

        iObject.__proto__ = iProto;

        for (var iKey in iProperty)
            if (
                this.prototype.hasOwnProperty.call(iProperty, iKey)  &&
                (iProperty[iKey].value !== undefined)
            )
                iObject[iKey] = iProperty[iKey].value;

        return iObject;
    };

    /* ----- Number Patch ----- */

    Number.isInteger = Number.isInteger  ||  function (value) {

        return  (typeof value === 'number')  &&  isFinite( value )  &&
            (Math.floor(value) === value);
    };

    Number.MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

    Number.MIN_SAFE_INTEGER = -Number.MAX_SAFE_INTEGER;

    Number.isSafeInteger = Number.isSafeInteger  ||  function (value) {

       return  this.isInteger( value )  &&  (
           Math.abs( value )  <=  this.MAX_SAFE_INTEGER
       );
    };

    /* ----- String Extension ----- */

    var _Trim_ = ''.trim;

    var Blank_Char = (! _Trim_)  &&  /(^\s*)|(\s*$)/g;

    String.prototype.trim = function (iChar) {
        if (! iChar)
            return  _Trim_  ?  _Trim_.call(this)  :  this.replace(Blank_Char, '');

        var iFrom = 0,  iTo;

        for (var i = 0;  iChar[i];  i++) {
            if ((! iFrom)  &&  (this[0] == iChar[i]))
                iFrom = 1;

            if ((! iTo)  &&  (this[this.length - 1] == iChar[i]))
                iTo = -1;

            if (iFrom && iTo)  break;
        }

        return  this.slice(iFrom, iTo);
    };

    String.prototype.repeat = String.prototype.repeat  ||  function (Times) {

        return  (new Array(Times + 1)).join(this);
    };

    /* ----- Array Patch ----- */

    var ArrayProto = Array.prototype;

    function Array_push(value, mapCall, mapContext) {

        return  ArrayProto.push.call(
            this,
            (mapCall instanceof Function)  ?
                mapCall.call(mapContext, value, this.length)  :  value
        );
    }

    Array.from = Array.from  ||  function (iterator) {

        var array, _This_;

        try {
            array = new this();
        } catch (error) {
            array = Object.create( this.prototype );
        }

        if (Number.isInteger( iterator.length )) {

            for (var i = 0, length = iterator.length;  i < length;  i++)
                Array_push.call(array, iterator[i], arguments[1], arguments[2]);

            return array;
        }

        if (iterator.next instanceof Function) {

            while ((_This_ = iterator.next()).done  ===  false)
                Array_push.call(array, _This_.value, arguments[1], arguments[2]);

            return array;
        }

        throw  TypeError('Cannot convert undefined or null to object');
    };

    ArrayProto.indexOf = ArrayProto.indexOf  ||  function () {

        for (var i = 0;  i < this.length;  i++)
            if (arguments[0] === this[i])
                return i;

        return -1;
    };

    ArrayProto.reduce = ArrayProto.reduce  ||  function (callback, value) {

        for (var i = 1, length = this.length;  i < length;  i++) {

            if (i == 1)  value = this[0];

            value = callback(value, this[i], i, this);
        }

        return value;
    };

    /* ----- Function Patch ----- */

    function FuncName() {
        return  (this.toString().trim().match(/^function\s+([^\(\s]*)/) || '')[1];
    }

    if (! ('name' in Function.prototype)) {

        if (document.documentMode > 8)
            Object.defineProperty(Function.prototype,  'name',  {get: FuncName});
        else
            Function.prototype.name = FuncName;
    }

    /* ----- Date Patch ----- */

    Date.now = Date.now  ||  function () { return  +(new Date()); };

});