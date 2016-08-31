define(['jquery', 'extension/iRESTful'],  function ($) {

    $.fn.load = function (iURL, iData, iCallback) {
        if (! this[0])  return this;

        iURL = $.split(iURL.trim(), /\s+/, 2, ' ');

        if (typeof iData == 'function') {
            iCallback = iData;
            iData = null;
        }

        var $_This = this;

        $[iData ? 'post' : 'get'](iURL[0], iData, function (iFragment) {
            $_This.children().fadeOut();

            $_This.empty()[0].appendChild( iFragment );

            var $_Script = $( iFragment.children )
                    .filter('script').not('[src]').remove();

            for (var i = 0;  $_Script[i];  i++)
                $.globalEval( $_Script[i].text );

            if (typeof iCallback == 'function')
                for (var i = 0;  $_This[i];  i++)
                    iCallback.apply($_This[i], arguments);
        });

        return this;
    };

});