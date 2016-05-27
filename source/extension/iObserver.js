define(['jquery'],  function ($) {

    function Observer() {
        this.requireArgs = arguments[0] || 0;
        this.filter = arguments[1] || [ ];
        this.table = [[ ]];

        return this;
    }

    function Each_Row() {
        var _This_ = this,  iArgs = $.makeArray(arguments);

        if (typeof iArgs[iArgs.length - 1]  !=  'function')  return;

        var iTable = this.table,  iCallback = iArgs.pop();

        $.each(iTable[0],  function (Index) {
            if (arguments[1] == null)  return;

            for (var i = 0, _Condition_;  iArgs[i] && iTable[i + 1];  i++) {
                _Condition_ = iTable[i + 1][Index];

                if (_Condition_ === undefined) {

                    if (i < _This_.requireArgs)  return;

                } else if (
                    (_Condition_ != iArgs[i])  ||
                    (! iArgs[i].match(_Condition_))  ||  (
                        (typeof _This_.filter[i] == 'function')  &&
                        (false === _This_.filter[i].call(
                            _This_,  _Condition_,  iArgs[i]
                        ))
                    )
                )
                    return;
            }

            if (false  ===  iCallback.call(_This_, this))
                iTable[0][Index] = null;
        });
    }

    $.extend(Observer.prototype, {
        on:         function () {
            var iArgs = $.makeArray(arguments);

            if (typeof iArgs[iArgs.length - 1]  ==  'function') {
                var Index = this.table[0].push( iArgs.pop() )  -  1;

                for (var i = 0;  i < iArgs.length;  i++) {
                    if (! this.table[i + 1])
                        this.table[i + 1] = [ ];

                    this.table[i + 1][Index] = iArgs[i];
                }
            }
            return this;
        },
        off:        function () {
            var iArgs = $.makeArray(arguments);

            var iCallback = (typeof iArgs[iArgs.length - 1]  ==  'function')  &&
                    iArgs.pop();

            iArgs.push(function () {
                return  (iCallback !== false)  &&  (iCallback !== arguments[0]);
            });

            Each_Row.apply(this, iArgs);

            return this;
        },
        one:        function () {
            var iArgs = $.makeArray(arguments);

            if (typeof iArgs[iArgs.length - 1]  ==  'function') {
                var iCallback = iArgs.pop();

                iArgs.push(function () {
                    this.off.apply(this, iArgs);

                    return  iCallback.apply(this, arguments);
                });

                this.on.apply(this, iArgs);
            }

            return this;
        },
        trigger:    function () {
            var iArgs = $.makeArray(arguments),  iReturn;

            var iData = $.likeArray(iArgs[iArgs.length - 1])  &&  iArgs.pop();

            iArgs.push(function () {
                var _Return_ = arguments[0].apply(this, iData);

                iReturn = $.isData(_Return_) ? _Return_ : iReturn;
            });

            Each_Row.apply(this, iArgs);

            return iReturn;
        }
    });

    $.Observer = Observer;

});