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
                    $.proxy.apply($,  $.merge([iProxy, this], arguments));
            };
        },
        /**
         * 对象交集
         *
         * @author   TechQuery
         *
         * @memberof $
         *
         * @param    {(object|array)} set
         *
         * @returns  {(object|array)} Intersect of parameters
         */
        intersect:    function intersect(set) {

            if (arguments.length < 2)  return set;

            var isArray = $.likeArray( set );

            set = Array.from( arguments );

            set[0] = $.map(set.shift(),  function (value, key) {
                if ( isArray ) {
                    if (set.indexOf.call(set[0], value)  >  -1)
                        return value;
                } else if (
                    (set[0][key] !== undefined)  &&  (set[0][key] === value)
                )
                    return value;
            });

            return  intersect.apply(this, set);
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