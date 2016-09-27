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

    function HTML_Exec($_Fragment) {
        var iDOM,  _This_ = this;

        while ( $_Fragment[0] ) {
            if ($_Fragment[0].tagName != 'SCRIPT')
                iDOM = $_Fragment[0];
            else if (! $_Fragment[0].src)
                iDOM = $('<script />').prop('text', $_Fragment[0].text)[0];
            else
                return  (new Promise(function () {
                    _This_.appendChild(
                        $('<script />')
                            .on('load', arguments[0]).on('error', arguments[1])
                            .prop('src', $_Fragment[0].src)[0]
                    );
                    $_Fragment.shift();

                })).then($.proxy(arguments.callee, this, $_Fragment));

            this.appendChild( iDOM );
            $_Fragment.shift();
        }

        return Promise.resolve('');
    }

    $.fn.load = function (iURL, iData, iCallback) {
        if (! this[0])  return this;

        iURL = $.split(iURL.trim(), /\s+/, 2, ' ');

        if (typeof iData == 'function') {
            iCallback = iData;
            iData = null;
        }

        var $_This = this;

        $[iData ? 'post' : 'get'](iURL[0],  iData,  function (iHTML, _, iXHR) {

            var iHTML = (typeof iHTML == 'string')  ?  iHTML  :  iXHR.responseText;

            $_This.each(function () {
                var $_Box = $(this);

                $_Box.children().fadeOut().promise().then(function () {

                    return HTML_Exec.call(
                        $_Box.empty()[0],  $.makeArray( $(iHTML) )
                    );
                }).then(function () {
                    if (typeof iCallback == 'function')
                        iCallback.call($_Box[0], iHTML, _, iXHR);
                });
            });
        },  'html');

        return this;
    };

});