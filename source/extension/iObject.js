define(['jquery', 'extension/ES-5'],  function ($) {

    $.likeArray = function (iObject) {
        if ((! iObject)  ||  (typeof iObject != 'object'))
            return false;

        iObject = (typeof iObject.valueOf == 'function')  ?
            iObject.valueOf() : iObject;

        return Boolean(
            iObject  &&
            (typeof iObject.length == 'number')  &&
            (typeof iObject != 'string')
        );
    };

    $.makeSet = function () {
        var iArgs = arguments,  iValue = true,  iSet = { };

        if (this.likeArray( iArgs[1] )) {
            iValue = iArgs[0];
            iArgs = iArgs[1];
        } else if (this.likeArray( iArgs[0] )) {
            iValue = iArgs[1];
            iArgs = iArgs[0];
        }

        for (var i = 0;  i < iArgs.length;  i++)
            iSet[ iArgs[i] ] = (typeof iValue != 'function')  ?
                iValue  :  iValue( iArgs[i] );

        return iSet;
    };

    var DataType = $.makeSet('string', 'number', 'boolean');

    $.isData = function (iValue) {
        var iType = typeof iValue;

        return  Boolean(iValue)  ||  (iType in DataType)  ||  (
            (iValue !== null)  &&  (iType == 'object')  &&
            (typeof iValue.valueOf() in DataType)
        );
    };

    $.isEqual = function (iLeft, iRight, iDepth) {
        iDepth = iDepth || 1;

        if (!  (iLeft && iRight))
            return  (iLeft === iRight);

        iLeft = iLeft.valueOf();  iRight = iRight.valueOf();

        if ((typeof iLeft != 'object')  ||  (typeof iRight != 'object'))
            return  (iLeft === iRight);

        var Left_Key = Object.getOwnPropertyNames(iLeft),
            Right_Key = Object.getOwnPropertyNames(iRight);

        if (Left_Key.length != Right_Key.length)  return false;

        Left_Key.sort();  Right_Key.sort();  --iDepth;

        for (var i = 0, _Key_;  i < Left_Key.length;  i++) {
            _Key_ = Left_Key[i];

            if (_Key_ != Right_Key[i])  return false;

            if (! iDepth) {
                if (iLeft[_Key_] !== iRight[_Key_])  return false;
            } else {
                if (! arguments.callee.call(
                    this, iLeft[_Key_], iRight[_Key_], iDepth
                ))
                    return false;
            }
        }
        return true;
    };

    $.trace = function (iObject, iName, iCount, iCallback) {
        if (typeof iCount == 'function')  iCallback = iCount;
        iCount = parseInt(iCount);
        iCount = isNaN(iCount) ? Infinity : iCount;

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

    $.intersect = function () {
        if (arguments.length < 2)  return arguments[0];

        var iArgs = this.makeArray( arguments );
        var iArray = this.likeArray( iArgs[0] );

        iArgs[0] = this.map(iArgs.shift(),  function (iValue, iKey) {
            if ( iArray ) {
                if (iArgs.indexOf.call(iArgs[0], iValue)  >  -1)
                    return iValue;
            } else if (
                (iArgs[0][iKey] !== undefined)  &&
                (iArgs[0][iKey] === iValue)
            )
                return iValue;
        });

        return  arguments.callee.apply(this, iArgs);
    };

});