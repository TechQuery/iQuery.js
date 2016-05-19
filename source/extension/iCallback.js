define(['jquery'],  function ($) {

    function ConditionCallback() {
        this.filter = arguments;
        this.callback = { };

        return this;
    }

    function fetchArray(iObject) {
        var iArray = [ ];

        if (! (iObject instanceof Array))
            for (var iKey in iObject)
                iArray = iArray.concat( arguments.callee( iObject[iKey] ) );

        return iArray;
    }

    $.extend(ConditionCallback.prototype, {
        on:         function () {
            var iArgs = $.makeArray(arguments);

            var iCallback = (typeof iArgs[iArgs.length - 1] == 'function')  &&
                    iArgs.pop();

            for (var i = 0, _Level_ = this.callback;  i < iArgs.length;  i++) {
                _Level_ = _Level_[iArgs[i]] =
                    ((i + 1)  ==  iArgs.length)  ?
                        [ ]  :  (_Level_[iArgs[i]] || { });

                if (_Level_ instanceof Array)  _Level_.push( iCallback );
            }

            return this;
        },
        trigger:    function () {
            var iArgs = $.makeArray(arguments),  iLevel = this.callback,  iReturn;

            var iData = $.likeArray(iArgs[iArgs.length - 1])  &&  iArgs.pop();

            for (var i = 0;  i < iArgs.length;  i++) {
                if (
                    (typeof this.filter[i] == 'function')  &&
                    (false  ===  this.filter[i].call(this, iArgs[i]))
                )
                    return;
                iLevel = iLevel[iArgs[i]];
            }
            iLevel = fetchArray(iLevel);

            for (var i = 0, _Return_;  i < iLevel.length;  i++) {
                _Return_ = iLevel[i].apply(this,  iData || [ ]);

                if ($.isData(_Return_))  iReturn = _Return_;
            }

            return iReturn;
        }
    });

    $.ConditionCallback = ConditionCallback;

});