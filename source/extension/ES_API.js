define(function () {

    var BOM = self,  DOM = self.document;

    /* ----- Object Patch ----- */

    if (! Object.keys)
        Object.keys = function (iObject) {
            var iKey = [ ];

            for (var _Key_ in iObject)
                if ( this.prototype.hasOwnProperty.call(iObject, _Key_) )
                    iKey.push(_Key_);

            return iKey;
        };

    Object.getPrototypeOf = Object.getPrototypeOf  ||  function (iObject) {
        return  (iObject != null)  &&  (
            iObject.constructor.prototype || iObject.__proto__
        );
    };

    Object.create = Object.create  ||  function (iProto, iProperty) {
        if (typeof iProto != 'object')
            throw TypeError('Object prototype may only be an Object or null');

        function iTemp() { }

        iTemp.prototype = iProto;

        var iObject = new iTemp();

        for (var iKey in iProperty)
            if (
                this.prototype.hasOwnProperty.call(iProperty, iKey)  &&
                (iProperty[iKey].value !== undefined)
            )
                iObject[iKey] = iProperty[iKey].value;

        return iObject;
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

    String.prototype.toCamelCase = function () {
        var iName = this.split(arguments[0] || '-');

        for (var i = 1;  i < iName.length;  i++)
            iName[i] = iName[i][0].toUpperCase() + iName[i].slice(1);

        return iName.join('');
    };

    String.prototype.toHyphenCase = function () {
        return  this.replace(/([a-z0-9])[\s_]?([A-Z])/g,  function () {
            return  arguments[1] + '-' + arguments[2].toLowerCase();
        });
    };

    /* ----- Array Extension ----- */

    Array.prototype.indexOf = Array.prototype.indexOf  ||  function () {
        for (var i = 0;  i < this.length;  i++)
            if (arguments[0] === this[i])
                return i;

        return -1;
    };

    Array.prototype.reduce = Array.prototype.reduce  ||  function () {
        var iResult = arguments[1];

        for (var i = 1;  i < this.length;  i++) {
            if (i == 1)  iResult = this[0];

            iResult = arguments[0](iResult, this[i], i, this);
        }

        return iResult;
    };

    /* ----- Function Extension ----- */

    function FuncName() {
        return  (this.toString().trim().match(/^function\s+([^\(\s]*)/) || '')[1];
    }

    if (! ('name' in Function.prototype)) {
        if (DOM.documentMode > 8)
            Object.defineProperty(Function.prototype,  'name',  {get: FuncName});
        else
            Function.prototype.name = FuncName;
    }

    /* ----- Date Extension ----- */

    Date.now = Date.now  ||  function () { return  +(new Date()); };


    /* ----- JSON Extension  v0.4 ----- */

    BOM.JSON.format = function () {
        return  this.stringify(arguments[0], null, 4)
            .replace(/(\s+"[^"]+":) ([^\s]+)/g, '$1    $2');
    };

    BOM.JSON.parseAll = function (iJSON) {
        return  BOM.JSON.parse(iJSON,  function (iKey, iValue) {
            if (iKey && (typeof iValue == 'string'))  try {
                return  BOM.JSON.parse(iValue);
            } catch (iError) { }

            return iValue;
        });
    };
});