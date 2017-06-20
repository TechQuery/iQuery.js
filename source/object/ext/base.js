define(['../../polyfill/ES_API'],  function () {

    function likeArray(iObject) {

        if ((! iObject)  ||  (typeof iObject != 'object'))
            return false;

        iObject = (typeof iObject.valueOf == 'function')  ?
            iObject.valueOf() : iObject;

        return Boolean(
            iObject  &&
            (typeof iObject.length == 'number')  &&
            (typeof iObject != 'string')
        );
    }

    function makeSet() {

        var iArgs = arguments,  iValue = true,  iSet = { };

        if (likeArray( iArgs[1] )) {

            iValue = iArgs[0];

            iArgs = iArgs[1];

        } else if (likeArray( iArgs[0] )) {

            iValue = iArgs[1];

            iArgs = iArgs[0];
        }

        for (var i = 0;  i < iArgs.length;  i++)
            iSet[ iArgs[i] ] = (typeof iValue != 'function')  ?
                iValue  :  iValue(iArgs[i], i, iArgs);

        return iSet;
    }

    var WindowType = makeSet('Window', 'DOMWindow', 'global');

    return {
        likeArray:       likeArray,
        Type:            function (iVar) {
            var iType;

            try {
                iType = Object.prototype.toString.call( iVar ).slice(8, -1);

                var iName = iVar.constructor.name;

                iName = (typeof iName == 'function')  ?
                    iName.call( iVar.constructor )  :  iName;

                if ((iType == 'Object')  &&  iName)  iType = iName;
            } catch (iError) {
                return 'Window';
            }

            if (! iVar)
                return  (isNaN(iVar)  &&  (iVar !== iVar))  ?  'NaN'  :  iType;

            if (WindowType[iType] || (
                (iVar == iVar.document) && (iVar.document != iVar)    //  IE 9- Hack
            ))
                return 'Window';

            if (iVar.location  &&  (iVar.location === (
                iVar.defaultView || iVar.parentWindow || { }
            ).location))
                return 'Document';

            if (
                iType.match(/HTML\w+?Element$/) ||
                (typeof iVar.tagName == 'string')
            )
                return 'HTMLElement';

            if (this.likeArray( iVar )) {
                iType = 'Array';
                try {
                    iVar.item();
                    try {
                        iVar.namedItem();

                        return 'HTMLCollection';

                    } catch (iError) {

                        return 'NodeList';
                    }
                } catch (iError) { }
            }

            return iType;
        },
        isEqual:         function isEqual(iLeft, iRight, iDepth) {

            iDepth = iDepth || 1;

            if (!  (iLeft && iRight))
                return  (iLeft === iRight);

            iLeft = iLeft.valueOf();  iRight = iRight.valueOf();

            if ((typeof iLeft != 'object')  ||  (typeof iRight != 'object'))
                return  (iLeft === iRight);

            var Left_Key = Object.keys( iLeft ),
                Right_Key = Object.keys( iRight );

            if (Left_Key.length != Right_Key.length)  return false;

            Left_Key.sort();  Right_Key.sort();  --iDepth;

            for (var i = 0, _Key_;  i < Left_Key.length;  i++) {

                _Key_ = Left_Key[i];

                if (_Key_ != Right_Key[i])  return false;

                if (! iDepth) {
                    if (iLeft[_Key_] !== iRight[_Key_])  return false;
                } else {
                    if (! isEqual.call(
                        this, iLeft[_Key_], iRight[_Key_], iDepth
                    ))
                        return false;
                }
            }
            return true;
        },
        trace:           function (iObject, iName, iCount, iCallback) {

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
        },
        makeSet:         makeSet,
        makeIterator:    function (array) {

            var nextIndex = 0;

            return {
                next:    function () {

                    return  (nextIndex >= array.length)  ?
                        {done: true}  :  {done: false,  value: array[nextIndex++]};
                }
            };
        }
    };
});