define(['jquery'],  function ($) {

    var BOM = self;

/* ---------- RESTful API ---------- */

    function HTTP_Request(iMethod, iURL, iData, iCallback, DataType) {
        if (typeof iData == 'function') {
            DataType = iCallback;
            iCallback = iData;
            iData = null;
        }
        return  $.ajax({
            type:           iMethod,
            url:            iURL,
            crossDomain:    true,
            data:           iData,
            dataType:       DataType,
            success:        iCallback
        });
    }

    var _Patch_ = ($ !== BOM.iQuery);

    var HTTP_Method = $.makeSet.apply(
            $,  ['PUT', 'DELETE'].concat(_Patch_  ?  [ ]  :  ['GET', 'POST'])
        );

    for (var iMethod in HTTP_Method)
        $[ iMethod.toLowerCase() ] = $.proxy(HTTP_Request, BOM, iMethod);

    if (! _Patch_)  $.getJSON = $.get;


/* ---------- Smart Load ---------- */

    $.fn.load = function (iURL, iData, iCallback) {
        if (! this[0])  return this;

        iURL = $.split(iURL.trim(), /\s+/, 2, ' ');

        if (typeof iData == 'function') {
            iCallback = iData;
            iData = null;
        }

        var $_This = this;

        $[iData ? 'post' : 'get'](iURL[0],  iData,  function ($_Fragment) {
            $_Fragment = $(
                (typeof $_Fragment == 'string')  ?
                    $_Fragment  :  $_Fragment.children
            );
            var $_Script = $_Fragment.filter('script');

            $_Fragment = $_Fragment.not( $_Script );

            $_This.children().fadeOut();

            $_This.empty().append( $_Fragment );

            $_Script.each(function () {
                var $_JS = $('<script />');

                if (! this.src)
                    $_JS[0].text = this.text;
                else
                    $_JS[0].src = this.src;

                $_JS.insertTo($_This, arguments[0]);
            });

            if (typeof iCallback == 'function')
                for (var i = 0;  $_This[i];  i++)
                    iCallback.apply($_This[i], arguments);
        },  'html');

        return this;
    };

});