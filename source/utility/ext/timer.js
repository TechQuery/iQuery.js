define(['../../object/index'],  function ($) {

    var _Timer_ = { };

    return $.extend({
        every:       function (iSecond, iCallback) {

            var iTimeOut = (iSecond || 0.01)  *  1000,
                iStart = Date.now(),
                Index = 0;

            return  setTimeout(function loop() {

                if (false !== iCallback(
                    ++Index,  (Date.now() - iStart)  /  1000
                ))
                    setTimeout(loop, iTimeOut);
            }, iTimeOut);
        },
        wait:        function (iSecond, iCallback) {

            return  this.every(iSecond,  function () {

                iCallback.apply(this, arguments);

                return false;
            });
        },
        start:       function (iName) {

            return  (_Timer_[iName] = Date.now());
        },
        end:         function (iName) {

            return  (Date.now() - _Timer_[iName])  /  1000;
        },
        /**
         * 函数节流
         *
         * @author   TechQuery
         *
         * @memberof $
         *
         * @param    {number}   [second=0.25] - Minimum interval in second
         * @param    {function} origin        - Original function
         *
         * @returns  {function} Wrapped function
         */
        throttle:    function (second, origin) {

            if (! $.isNumeric( second )) {

                origin = second;    second = 0;
            }

            second = (second || 0.25)  *  1000;

            var Last_Exec = 0;

            return  function () {

                var now = Date.now();

                if (Last_Exec + second  <=  now) {

                    Last_Exec = now;

                    return  origin.apply(this, arguments);
                }
            };
        },
        /**
         * 唯一标识符生成
         *
         * @author   TechQuery
         *
         * @memberof $
         *
         * @param    {string} prefix
         *
         * @returns  {string}
         */
        uuid:        function (prefix) {

            return  (prefix || 'uuid')  +  '_'  +
                (Date.now() + Math.random()).toString(36)
                    .replace('.', '').toUpperCase();
        }
    });
});