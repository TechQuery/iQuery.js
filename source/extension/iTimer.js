define(['jquery'],  function ($) {

    var _Timer_ = { };

    $.extend({
        _Root_:      BOM,
        now:         Date.now,
        every:       function (iSecond, iCallback) {
            var _BOM_ = this._Root_,
                iTimeOut = (iSecond || 0.01) * 1000,
                iStart = this.now(),
                Index = 0;

            return  _BOM_.setTimeout(function () {
                var iDuring = (Date.now() - iStart) / 1000;

                var iReturn = iCallback.call(_BOM_, ++Index, iDuring);

                if ((typeof iReturn == 'undefined')  ||  iReturn)
                    _BOM_.setTimeout(arguments.callee, iTimeOut);
            }, iTimeOut);
        },
        wait:        function (iSecond, iCallback) {
            return  this.every(iSecond, function () {
                iCallback.apply(this, arguments);
                return false;
            });
        },
        start:       function (iName) {
            return  (_Timer_[iName] = this.now());
        },
        end:         function (iName) {
            return  (this.now() - _Timer_[iName]) / 1000;
        },
        throttle:    function (iSecond, iOrigin) {
            if (typeof iSecond != 'number') {
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
                (this.now() + Math.random()).toString(36)
                    .replace('.', '').toUpperCase();
        }
    });

});