define(['./index', '../DOM/ext/base'],  function ($) {

/* ---------- RESTful API ---------- */

    $.map(['get', 'post', 'put', 'delete'],  function (method) {

        $[ method ] = function (iURL, iData, iCallback, DataType) {

            if (typeof iData == 'function')
                DataType = iCallback,  iCallback = iData,  iData = null;

            return  $.ajax({
                type:           method,
                url:            iURL,
                crossDomain:    true,
                data:           iData,
                dataType:       DataType,
                success:        iCallback
            });
        };
    });

    $.getJSON = $.get;


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