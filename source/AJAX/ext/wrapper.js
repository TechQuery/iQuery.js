define(['../../iQuery', '../index', '../../DOM/ext/base'],  function ($) {

/* ---------- RESTful API ---------- */

    $.map(['get', 'post', 'put', 'delete'],  function (method) {

        $[ method ] = $[ method ]  ||  function (URL, data, callback, DataType) {

            if (typeof data === 'function')
                DataType = callback,  callback = data,  data = null;

            return $.ajax($.extend(
                {
                    type:           method,
                    url:            URL,
                    crossDomain:    true,
                    data:           data,
                    dataType:       DataType,
                    success:        callback
                },
                $.isPlainObject( URL )  ?  URL  :  { }
            ));
        };
    });

    $.getJSON = $.getJSON || $.get;


/* ---------- Smart Load ---------- */

    $.fn.load = function (iURL, iData, iCallback) {

        if (! this[0])  return this;

        if (typeof iData == 'function')
            iCallback = iData,  iData = null;

        var $_This = this;

        iURL = iURL.trim().split(/\s+/);

        $[iData ? 'post' : 'get'](iURL[0],  iData,  function (iHTML, _, iXHR) {

            $_This.htmlExec(
                (typeof iHTML === 'string')  ?  iHTML  :  iXHR.responseText,
                iURL[1]
            );

            if (typeof iCallback === 'function')
                $_This.each( $.proxy(iCallback, null, iHTML, _, iXHR) );
        },  'html');

        return this;
    };

});