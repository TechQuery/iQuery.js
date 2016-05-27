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

    function AJAX_Complete(iOption) {
        var iHeader = { };

        if (arguments[4])
            $.each(arguments[4].split("\r\n"),  function () {
                var _Header_ = $.split(this, /:\s+/, 2);

                iHeader[_Header_[0]] = _Header_[1];
            });

        $.extend(this, {
            status:          arguments[1],
            statusText:      arguments[2],
            responseText:    arguments[3].text,
            responseType:    (
                (iHeader['Content-Type'] || '').split(';')[0].split('/')[1]
            )  ||  'text'
        });

        switch ( this.responseType ) {
            case 'text':    ;
            case 'html':    this.response = this.responseText;
            case 'json':
                try {
                    this.response = $.parseJSON( this.responseText );
                    this.responseType = 'json';
                } catch (iError) {
                    if ($.browser.msie != 9)  try {
                        if (! $.browser.mozilla)
                            this.response = $.parseXML( this.responseText );
                        else if (this.responseXML)
                            this.response = this.responseXML;
                        else
                            break;
                        this.responseType = 'xml';
                    } catch (iError) { }
                }
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
            iOption.data = $.extend($.paramJSON(iOption.url), iOption.data);

            iOption.url = iOption.url.split('?')[0] + (
                $.isEmptyObject( iOption.data )  ?
                    ''  :  ('?' + $.param(iOption.data))
            );
        }
        var iXHR = new BOM.XMLHttpRequest(),  iArgs = [iOption, iOption, iXHR];

        iAJAX.trigger('prefilter', iArgs);

        iXHR = iAJAX.trigger('transport', iOption.dataType, iArgs);

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

        var $_This = this;

        iURL = $.split(iURL.trim(), /\s+/, 2, ' ');

        if (typeof iData == 'function') {
            iCallback = iData;
            iData = null;
        }

        function Append_Back() {
            $_This.children().fadeOut();

            var $_Content = $(arguments[0]);
            var $_Script = $_Content.filter('script').not('[src]');

            arguments[0] = $_Content.not( $_Script )
                .appendTo( $_This.empty() ).fadeIn();

            for (var i = 0;  i < $_Script.length;  i++)
                $.globalEval( $_Script[i].text );

            if (typeof iCallback == 'function')
                for (var i = 0;  i < $_This.length;  i++)
                    iCallback.apply($_This[i], arguments);
        }

        function Load_Back(iHTML) {
            if (typeof iHTML != 'string')  return;

            if (! iHTML.match(/<\s*(html|head|body)(\s|>)/i)) {
                Append_Back.apply(this, arguments);
                return;
            }

            var _Context_ = [this, $.makeArray(arguments)];

            $(DOM.body).sandBox(iHTML,  iURL[1],  function ($_innerDOM) {
                _Context_[1][0] = $_innerDOM;

                Append_Back.apply(_Context_[0], _Context_[1]);

                return false;
            });
        }

        $[iData ? 'post' : 'get'](iURL[0], iData, Load_Back);

        return this;
    };

});