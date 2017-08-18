define(['../../iQuery'],  function ($) {

    return $.extend({
        formatJSON:    function () {

            return  JSON.stringify(arguments[0], null, 4)
                .replace(/(\s+"[^"]+":) ([^\s]+)/g, '$1    $2');
        },
        curry:         function (iOrigin) {

            return  function iProxy() {

                return  (arguments.length >= iOrigin.length)  ?
                    iOrigin.apply(this, arguments)  :
                    iProxy.bind.apply(iProxy,  $.merge([this], arguments));
            };
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
                else if (typeof source[key] === 'object')
                    target[key] = patch(target[key] || { },  source[key]);
                else if (! (target[key] != null))
                    target[key] = source[key];
            }

            if (typeof target === 'function')
                patch(target.prototype,  (source || '').prototype);

            return target;
        }
    });
});