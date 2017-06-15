define(['../../object/index'],  function ($) {

    var _Timer_ = { };

    return {
        every:       function every(iSecond, iCallback) {

            var iTimeOut = (iSecond || 0.01)  *  1000,
                iStart = Date.now(),
                Index = 0;

            return  setTimeout(function () {

                if (false === iCallback(
                    ++Index,  (Date.now() - iStart)  /  1000
                ))
                    setTimeout(every, iTimeOut);
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
        throttle:    function (iSecond, iOrigin) {

            if (! $.isNumeric( iSecond )) {
                iOrigin = iSecond;
                iSecond = 0;
            }
            iSecond = (iSecond || 0.25)  *  1000;

            var Last_Exec = 0;

            return  function () {

                var iNow = Date.now();

                if (Last_Exec + iSecond  <=  iNow) {
                    Last_Exec = iNow;

                    return  iOrigin.apply(this, arguments);
                }
            };
        },
        uuid:        function () {

            return  (arguments[0] || 'uuid')  +  '_'  +
                (Date.now() + Math.random()).toString(36)
                    .replace('.', '').toUpperCase();
        }
    };
});