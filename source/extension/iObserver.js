define(['jquery'],  function ($) {

    function Observer() {
        this.requireArgs = arguments[0] || 0;
        this.filter = arguments[1] || [ ];
        this.table = [ ];

        return this;
    }

    function Each_Row() {
        var _This_ = this,  iArgs = $.makeArray(arguments);

        if (typeof iArgs[iArgs.length - 1]  !=  'function')  return;

        var WrapCall = iArgs.pop();

        $.each(this.table,  function () {
            var iCallback = this[this.length - 1];

            if (iCallback == null)  return;

            for (var i = 0;  iArgs[i];  i++) {
                if (typeof this[i] == 'function')  break;

                if (this[i] === undefined) {

                    if (i < _This_.requireArgs)  return;

                } else if (
                    (this[i] != iArgs[i])  ||
                    (! iArgs[i].match(this[i]))  ||  (
                        (typeof _This_.filter[i] == 'function')  &&
                        (false === _This_.filter[i].call(
                            _This_,  this[i],  iArgs[i]
                        ))
                    )
                )
                    return;
            }

            if (false  ===  WrapCall.call(_This_, iCallback))
                this[this.length - 1] = null;
        });
    }

    $.extend(Observer.prototype, {
        on:         function () {
            if (typeof arguments[arguments.length - 1]  ==  'function') {
                var iArgs = $.makeArray(arguments);

                for (var i = 0;  this.table[i];  i++)
                    if ($.isEqual(this.table[i], iArgs))
                        return this;

                this.table.push(iArgs);
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