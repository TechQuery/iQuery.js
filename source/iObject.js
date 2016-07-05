define(['extension/iObject'],  function ($) {

    $.isPlainObject = function (iValue) {
        return  iValue && (iValue.constructor === Object);
    };

    $.fn.extend = $.extend = function () {
        var iDeep = (arguments[0] === true);
        var iTarget,
            iFirst = iDeep ? 1 : 0;

        if (arguments.length  >  (iFirst + 1)) {
            iTarget = arguments[iFirst] || (
                (arguments[iFirst + 1] instanceof Array)  ?  [ ]  :  { }
            );
            iFirst++ ;
        } else
            iTarget = this;

        for (var i = iFirst, iValue;  i < arguments.length;  i++)
            for (var iKey in arguments[i])
                if (
                    Object.prototype.hasOwnProperty.call(arguments[i], iKey)  &&
                    (arguments[i][iKey] !== undefined)
                ) {
                    iTarget[iKey] = iValue = arguments[i][iKey];

                    if (iDeep)  try {
                        if ((iValue instanceof Array)  ||  $.isPlainObject(iValue))
                            iTarget[iKey] = arguments.callee.call(
                                this,  true,  undefined,  iValue
                            );
                    } catch (iError) { }
                }
        return iTarget;
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

                    if ((_Element_ !== undefined)  &&  (_Element_ !== null))
                        if (iArray)
                            iTarget = iTarget.concat(_Element_);
                        else
                            iTarget[iKey] = _Element_;
                });

            return iTarget;
        },
        makeArray:        $.browser.modern ?
            function () {
                return  Array.apply(null, arguments[0]);
            } :
            function () {
                return  this.extend([ ], arguments[0]);
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