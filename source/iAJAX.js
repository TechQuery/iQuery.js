define(['iEvent'],  function ($) {

    var BOM = self,  DOM = self.document;


/* ---------- AJAX API ---------- */

    var $_DOM = $(DOM),  iAJAX = new $.Observer(1);

    function AJAX_Register(iName) {
        var iArgs = $.makeArray(arguments).slice(1);

        var iCallback = iArgs[iArgs.length - 1];

        if (typeof iCallback != 'function')  return;

        iArgs.splice(-1,  1,  function () {
            return  iCallback.apply(BOM, $.makeArray(arguments).slice(1));
        });

        iAJAX.on.apply(iAJAX, [iName].concat(iArgs));
    }

    $.extend({
        ajaxPrefilter:    $.proxy(AJAX_Register, $, 'prefilter'),
        ajaxTransport:    $.proxy(AJAX_Register, $, 'transport')
    });

    $.ajaxTransport(function (iOption) {
        var iXHR;

        return {
            send:    function (iHeader, iComplete) {
                iXHR = new BOM.XMLHttpRequest();

                iXHR.open(iOption.type, iOption.url, true);

                iXHR[iOption.crossDomain ? 'onload' : 'onreadystatechange'] =
                    function () {
                        if (! (iOption.crossDomain || (iXHR.readyState == 4)))
                            return;

                        var iResponse = {text:  iXHR.responseText};
                        iResponse[ iXHR.responseType ] = iXHR.response;

                        iComplete(
                            iXHR.status,
                            iXHR.statusText,
                            iResponse,
                            iXHR.getAllResponseHeaders()
                        );
                    };

                if (iOption.xhrFields)  $.extend(iXHR, iOption.xhrFields);

                if (! iOption.crossDomain)
                    iOption.headers = $.extend(iOption.headers || { },  iHeader,  {
                        'X-Requested-With':    'XMLHttpRequest',
                        Accept:                '*/*'
                    });

                for (var iKey in iOption.headers)
                    iXHR.setRequestHeader(iKey, iOption.headers[iKey]);

                var iData = iOption.data;

                if ((iData instanceof Array)  ||  $.isPlainObject(iData))
                    iData = $.param(iData);

                if ((typeof iData == 'string')  ||  iOption.contentType)
                    iXHR.setRequestHeader('Content-Type', (
                        iOption.contentType || 'application/x-www-form-urlencoded'
                    ));

                iOption.data = iData;

                iXHR.send(iData);
            },
            abort:    function () {
                iXHR.onload = iXHR.onreadystatechange = null;
                iXHR.abort();
                iXHR = null;
            }
        };
    });

    var ResponseType = $.makeSet('html', 'xml', 'json');

    function AJAX_Complete(iOption) {
        var iHeader = { };

        if (arguments[4])
            $.each(arguments[4].split("\r\n"),  function () {
                var _Header_ = $.split(this, /:\s+/, 2);

                iHeader[_Header_[0]] = _Header_[1];
            });

        var iType = (iHeader['Content-Type'] || '').split(';')[0].split('/');

        $.extend(this, {
            status:          arguments[1],
            statusText:      arguments[2],
            responseText:    arguments[3].text,
            responseType:
                ((iType[1] in ResponseType) ? iType[1] : iType[0])  ||  'text'
        });

        this.response = this.responseText;

        switch ( this.responseType ) {
            case 'text':    ;
            case 'html':    if (this.responseText.match(/^\s*<.+?>/)) {
                try {
                    this.response = $.parseXML( this.responseText );
                    this.responseType = 'xml';
                } catch (iError) {
                    this.response = $.buildFragment(
                        $.parseHTML( this.responseText )
                    );
                    this.responseType = 'html';
                }
                break;
            }
            case 'json':
                try {
                    this.response = $.parseJSON( this.responseText );
                    this.responseType = 'json';
                } catch (iError) { }
                break;
            case 'xml':     this.response = this.responseXML;
        }

        var iArgs = [this, iOption];

        $_DOM.trigger('ajaxComplete', iArgs);

        if (arguments[1] < 400)
            $_DOM.trigger('ajaxSuccess', iArgs);
        else
            $_DOM.trigger('ajaxError',  iArgs.concat(new Error(this.statusText)));

        if (typeof iOption.success == 'function')
            iOption.success(this.response, 'success', this);
    }

    function HTTP_Request(iMethod, iURL, iData, iCallback) {
        if (typeof iData == 'function') {
            iCallback = iData;
            iData = { };
        }

        var iOption = {
                type:           iMethod,
                crossDomain:    $.isCrossDomain(iURL),
                dataType:       'text',
                data:           iData || { },
                success:        iCallback
            };

        iOption.url = iURL.replace(/&?(\w+)=\?/,  function () {
            if (iOption.jsonp = arguments[1])  iOption.dataType = 'jsonp';

            return '';
        });

        if (iMethod == 'GET') {
            var File_Name = $.fileName(iURL);

            if (!  (iOption.jsonp || $.browser.modern || $.map(
                $('link[rel="next"], link[rel="prefetch"]'),
                function () {
                    if ($.fileName( arguments[0].href )  ==  File_Name)
                        return iURL;
                }
            ).length))
                iOption.data._ = $.now();

            iOption.data = $.extend($.paramJSON(iOption.url), iOption.data);

            iOption.url = iOption.url.split('?')[0] + (
                $.isEmptyObject( iOption.data )  ?
                    ''  :  ('?' + $.param(iOption.data))
            );
        }
        var iXHR = new BOM.XMLHttpRequest(),  iArgs = [iOption, iOption, iXHR];

        iAJAX.trigger('prefilter', iArgs);

        iXHR = iAJAX.trigger('transport', iOption.dataType, iArgs).slice(-1)[0];

        iXHR.send({ },  $.proxy(AJAX_Complete, iXHR, iOption));

        if (iOption.timeout)
            $.wait(iOption.timeout / 1000,  function () {
                iXHR.abort();

                $_DOM.trigger('ajaxError', [
                    iXHR,  iOption,  new Error('XMLHttpRequest Timeout')
                ]);
            });

        $_DOM.trigger('ajaxSend',  [iXHR, iOption]);
    }

    var HTTP_Method = $.makeSet('GET', 'POST', 'PUT', 'DELETE');

    for (var iMethod in HTTP_Method)
        $[ iMethod.toLowerCase() ] = $.proxy(HTTP_Request, BOM, iMethod);

    $.getJSON = $.get;


/* ---------- Smart HTML Loading ---------- */

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

            for (var i = 0;  i < $_Script.length;  i++)
                $.globalEval( $_Script[i].text );

            if (typeof iCallback == 'function')
                for (var i = 0;  $_This[i];  i++)
                    iCallback.apply($_This[i], arguments);
        });

        return this;
    };

});
