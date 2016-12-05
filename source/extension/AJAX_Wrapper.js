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
        var $_Insert = [ ];

        for (var j = 0;  $_Fragment[0];  ) {
            if ($_Fragment[0].tagName != 'SCRIPT')
                $_Insert[j++] = $_Fragment[0];
            else {
                this.append( $_Insert );
                $_Insert.length = j = 0;

                if (! $_Fragment[0].src)
                    this.each(function () {
                        $('<script />').prop('text', $_Fragment[0].text)
                            .appendTo(this);
                    });
                else
                    return  Promise.all($.map(this,  function (_This_) {
                        return  new Promise(function () {
                            _This_.appendChild(
                                $('<script />')
                                    .on('load', arguments[0])
                                    .on('error', arguments[1])
                                    .prop('src', $_Fragment[0].src)[0]
                            );
                            $_Fragment.shift();
                        });
                    })).then($.proxy(arguments.callee, this, $_Fragment));
            }

            $_Fragment.shift();
        }

        this.append( $_Insert );

        return Promise.resolve('');
    }

    $.fn.htmlExec = function () {
        return  HTML_Exec.call(this,  $.makeArray( $(arguments[0]) ));
    };

    $.fn.load = function (iURL, iData, iCallback) {
        if (! this[0])  return this;

        if (typeof iData == 'function') {
            iCallback = iData;
            iData = null;
        }

        var $_This = this;

        iURL = iURL.trim().split(/\s+/);

        $[iData ? 'post' : 'get'](iURL[0],  iData,  function (iHTML, _, iXHR) {

            iHTML = (typeof iHTML == 'string')  ?  iHTML  :  iXHR.responseText;

            Promise.resolve(
                $_This.children().fadeOut(200).promise()
            ).then(function () {

                $_This.empty();

                if (! iURL[1])  return $_This.htmlExec(iHTML);

                $('<div />').append( iHTML ).find( iURL[1] ).appendTo( $_This );

            }).then(function () {

                if (typeof iCallback == 'function')
                    $_This.each($.proxy(iCallback, null, iHTML, _, iXHR));
            });
        },  'html');

        return this;
    };

});