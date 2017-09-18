define(['./checkType', './ext/base'],  function (checker, $) {

    function _Extend_(iTarget, iSource, iDeep) {

        iTarget = ((! iTarget)  &&  (iSource instanceof Array))  ?
            [ ]  :  Object( iTarget );

        iSource = Object( iSource );

        for (var iKey in iSource)
            if (
                (iSource[iKey] !== undefined)  &&
                Object.prototype.hasOwnProperty.call(iSource, iKey)
            ) {
                iTarget[iKey] = (iDeep && (
                    (iSource[iKey] instanceof Array)  ||
                    checker.isPlainObject( iSource[iKey] )
                ))  ?
                    _Extend_(iTarget[iKey], iSource[iKey], iDeep)  :
                    iSource[iKey];
            }
        return iTarget;
    }

    //  Thanks "ecalf" for
    //
    //      http://www.cnblogs.com/ecalf/archive/2012/12/06/2805546.html

    var ArrayProto = Array.prototype;

    function merge(target, source) {

        ArrayProto.push.apply(target, source);

        return target;
    }

    function makeArray(object) {
        try {
            return  merge([ ], object);

        } catch (error) {
            try {
                return  ArrayProto.slice.call(object, 0);
            } catch (error) {
                return  [ object ];
            }
        }
    }

    function extend() {

        var iArgs = makeArray( arguments );

        var iDeep = (iArgs[0] === true)  &&  iArgs.shift();

        if (iArgs.length < 2)  iArgs.unshift( this );

        for (var i = 1;  i < iArgs.length;  i++)
            iArgs[0] = _Extend_(iArgs[0], iArgs[i], iDeep);

        return iArgs[0];
    }

    return extend({
        makeArray:        makeArray,
        merge:            function (target, source) {

            return  merge(target,  makeArray( source ));
        },
        extend:           extend,
        each:             function (Arr_Obj, iEvery) {

            if ($.likeArray( Arr_Obj )) {

                for (var i = 0, length = Arr_Obj.length;  i < length;  i++)
                    if (false === iEvery.call(
                        Arr_Obj[ i ],  i,  Arr_Obj[ i ]
                    ))
                        break;
            } else
                for (var iKey in Arr_Obj)
                    if (false === iEvery.call(
                        Arr_Obj[ iKey ],  iKey,  Arr_Obj[ iKey ]
                    ))
                        break;

            return Arr_Obj;
        },
        map:              function (iSource, iCallback) {
            var iTarget = { },  iArray;

            if ($.likeArray( iSource )) {
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

            return  ArrayProto.indexOf.call(arguments[1], arguments[0]);
        },
        unique:           function (iArray) {
            var iResult = [ ];

            for (var i = iArray.length - 1, j = 0;  i > -1 ;  i--)
                if (this.inArray(iArray[i], iArray) == i)
                    iResult[j++] = iArray[i];

            return iResult.reverse();
        },
        proxy:            function (func, context) {

            var iArgs = Array.from( arguments ).slice(2);

            return  function () {

                return func.apply(
                    (context != null) ? context : this,  merge(iArgs, arguments)
                );
            };
        }
    }, checker, $);

});