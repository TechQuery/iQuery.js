define(['../../core/ObjectKit'],  function ($) {

    var DataType = $.makeSet('string', 'number', 'boolean');

    return {
        isData:       function (iValue) {

            var iType = typeof iValue;

            return  Boolean(iValue)  ||  (iType in DataType)  ||  (
                (iValue !== null)  &&  (iType == 'object')  &&
                (typeof iValue.valueOf() in DataType)
            );
        },
        intersect:    function intersect() {

            if (arguments.length < 2)  return arguments[0];

            var iArgs = Array.from( arguments );

            var iArray = $.likeArray( iArgs[0] );

            iArgs[0] = $.map(iArgs.shift(),  function (iValue, iKey) {
                if ( iArray ) {
                    if (iArgs.indexOf.call(iArgs[0], iValue)  >  -1)
                        return iValue;
                } else if (
                    (iArgs[0][iKey] !== undefined)  &&
                    (iArgs[0][iKey] === iValue)
                )
                    return iValue;
            });

            return  intersect.apply(this, iArgs);
        },
        patch:        function patch(target, source) {

            if (target === source)  return target;

            for (var key in source)  if (source[key] != null) {

                if ($.likeArray( source[key] ))
                    target[key] = $.merge(target[key] || [ ],  source[key]);
                else if (! (target[key] != null))
                    target[key] = (typeof source[key] != 'object')  ?
                        source[key]  :  patch(target[key] || { },  source[key]);
            }

            if (typeof target === 'function')
                patch(target.prototype,  (source || '').prototype);

            return target;
        },
        inherit:      function (iSup, iSub, iStatic, iProto) {

            for (var iKey in iSup)
                if (iSup.hasOwnProperty( iKey ))  iSub[iKey] = iSup[iKey];

            for (var iKey in iStatic)  iSub[iKey] = iStatic[iKey];

            iSub.prototype = $.extend(
                Object.create( iSup.prototype ),  iSub.prototype
            );
            iSub.prototype.constructor = iSub;

            for (var iKey in iProto)  iSub.prototype[iKey] = iProto[iKey];

            return iSub;
        }
    };
});