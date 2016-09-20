define(['extension/iObject'],  function ($) {

    $.isPlainObject = function (iValue) {
        return  iValue  &&  (typeof iValue == 'object')  &&  (
            Object.getPrototypeOf(iValue) === Object.prototype
        );
    };

    function _Extend_(iTarget, iSource, iDeep) {
        iTarget = ((! iTarget)  &&  (iSource instanceof Array))  ?
            [ ]  :  Object(iTarget);

        iSource = Object(iSource);

        for (var iKey in iSource)
            if (
                (iSource[iKey] !== undefined)  &&
                Object.prototype.hasOwnProperty.call(iSource, iKey)
            ) {
                iTarget[iKey] = (iDeep && (
                    (iSource[iKey] instanceof Array)  ||
                    $.isPlainObject( iSource[iKey] )
                ))  ?
                    arguments.callee(iTarget[iKey], iSource[iKey], iDeep)  :
                    iSource[iKey];
            }
        return iTarget;
    }

    $.makeArray = $.browser.modern ?
        function () {
            return  Array.apply(null, arguments[0]);
        } :
        function () {
            return  _Extend_([ ], arguments[0]);
        };

    $.fn.extend = $.extend = function () {
        var iArgs = $.makeArray( arguments );

        var iDeep = (iArgs[0] === true)  &&  iArgs.shift();

        if (iArgs.length < 2)  iArgs.unshift(this);

        for (var i = 1;  i < iArgs.length;  i++)
            iArgs[0] = _Extend_(iArgs[0], iArgs[i], iDeep);

        return iArgs[0];
    };

    $.extend({
        type:             function (iValue) {
            if (iValue === null)  return 'null';

            var iType = typeof (
                    (iValue && iValue.valueOf)  ?  iValue.valueOf()  :  iValue
                );
            return  (iType != 'object')  ?  iType  :
                Object.prototype.toString.call(iValue)
                    .split(' ')[1].slice(0, -1).toLowerCase();
        },
        isNumeric:        function (iValue) {
            iValue = (iValue && iValue.valueOf)  ?  iValue.valueOf()  :  iValue;

            if ((iValue === '')  ||  (iValue === Infinity)  ||  isNaN(iValue))
                return false;

            switch (typeof iValue) {
                case 'string':    break;
                case 'number':    break;
                default:          return false;
            }

            return  (typeof +iValue == 'number');
        },
        isEmptyObject:    function () {
            for (var iKey in arguments[0])
                return false;
            return true;
        },
        each:             function (Arr_Obj, iEvery) {
            if (this.likeArray( Arr_Obj ))
                for (var i = 0;  i < Arr_Obj.length;  i++)  try {
                    if (false  ===  iEvery.call(Arr_Obj[i], i, Arr_Obj[i]))
                        break;
                } catch (iError) {
                    console.dir( iError.valueOf() );
                }
            else
                for (var iKey in Arr_Obj)  try {
                    if (false === iEvery.call(
                        Arr_Obj[iKey],  iKey,  Arr_Obj[iKey]
                    ))
                        break;
                } catch (iError) {
                    console.dir( iError.valueOf() );
                }
            return Arr_Obj;
        },
        map:              function (iSource, iCallback) {
            var iTarget = { },  iArray;

            if (this.likeArray( iSource )) {
                iTarget = [ ];
                iArray = true;
            }

            if (typeof iCallback == 'function')
                this.each(iSource,  function (iKey) {
                    if (this === undefined)  return;

                    var _Element_ = iCallback(arguments[1], iKey, iSource);

                    if (_Element_ != null)
                        if (iArray)
                            iTarget = iTarget.concat(_Element_);
                        else
                            iTarget[iKey] = _Element_;
                });

            return iTarget;
        },
        inArray:          function () {
            return  Array.prototype.indexOf.call(arguments[1], arguments[0]);
        },
        merge:            function (iSource) {
            if (! (iSource instanceof Array))
                iSource = this.makeArray(iSource);

            for (var i = 1;  i < arguments.length;  i++)
                Array.prototype.splice.apply(iSource, Array.prototype.concat.apply(
                    [iSource.length, 0],
                    ($.likeArray( arguments[i] )  &&  (! $.browser.modern))  ?
                        $.makeArray( arguments[i] )  :  arguments[i]
                ));

            return iSource;
        },
        unique:           function (iArray) {
            var iResult = [ ];

            for (var i = iArray.length - 1, j = 0;  i > -1 ;  i--)
                if (this.inArray(iArray[i], iArray) == i)
                    iResult[j++] = iArray[i];

            return iResult.reverse();
        }
    });

});