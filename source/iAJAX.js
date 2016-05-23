define(['iEvent'],  function ($) {

    var BOM = self,  DOM = self.document;

    /* ----- XML HTTP Request ----- */

    var $_DOM = $(DOM);

    function onLoad(iOption, iProperty) {
        if (iProperty)  $.extend(this, iProperty);

        if (! (iOption.crossDomain || (this.readyState == 4)))
            return;

        var iError = (this.status > 399),  iArgs = [this, iOption];

        $_DOM.trigger('ajaxComplete', iArgs);
        $_DOM.trigger('ajax' + (iError ? 'Error' : 'Success'),  iArgs);

        if (typeof iOption.success == 'function')
            iOption.success(this.responseAny(), 'success', this);
    }

    var Success_State = {
            readyState:    4,
            status:        200,
            statusText:    'OK'
        };

    function XD_Request(iOption) {
        var iData = iOption.data;

        this.open.call(this, iOption.type, iOption.url, true);

        this[iOption.crossDomain ? 'onload' : 'onreadystatechange'] = $.proxy(
            onLoad,
            this,
            (! (this instanceof BOM.XMLHttpRequest))  &&  Success_State,
            null
        );

        if (iOption.xhrFields)  $.extend(this, iOption.xhrFields);

        if (! iOption.crossDomain)
            iOption.headers = $.extend(iOption.headers || { }, {
                'X-Requested-With':    'XMLHttpRequest',
                Accept:                '*/*'
            });

        for (var iKey in iOption.headers)
            this.setRequestHeader(iKey, iOption.headers[iKey]);

        if ((iData instanceof Array)  ||  $.isPlainObject(iData))
            iData = $.param(iData);

        if ((typeof iData == 'string')  ||  iOption.contentType)
            this.setRequestHeader('Content-Type', (
                iOption.contentType || 'application/x-www-form-urlencoded'
            ));

        iOption.data = iData;

        $_DOM.trigger('ajaxSend',  [this, iOption]);

        this.send(iData);

        return this;
    }

    var XHR_Extension = {
            timeOut:        function (iSecond, iCallback) {
                var iXHR = this;

                $.wait(iSecond, function () {
                    iXHR[
                        (iXHR.$_DOM || iXHR.option.crossDomain)  ?
                            'onload'  :  'onreadystatechange'
                    ] = null;
                    iXHR.abort();
                    iCallback.call(iXHR);
                    iXHR = null;
                });
            },
            responseAny:    function () {
                var iContent = this.responseText,
                    iType = this.responseType || 'text/plain';

                switch ( iType.split('/')[1] ) {
                    case 'plain':    ;
                    case 'json':     {
                        var _Content_ = iContent.trim();
                        try {
                            iContent = $.parseJSON(_Content_);
                            this.responseType = 'application/json';
                        } catch (iError) {
                            if ($.browser.msie != 9)  try {
                                if (! $.browser.mozilla)
                                    iContent = $.parseXML(_Content_);
                                else if (this.responseXML)
                                    iContent = this.responseXML;
                                else
                                    break;
                                this.responseType = 'text/xml';
                            } catch (iError) { }
                        }
                        break;
                    }
                    case 'xml':      iContent = this.responseXML;
                }

                return iContent;
            },
            retry:          function () {
                $.wait(arguments[0],  $.proxy(XD_Request, this));
            }
        };

    $.extend(BOM.XMLHttpRequest.prototype, XHR_Extension);

    /* ----- HTTP Wraped Method ----- */

    $.extend({
        ajaxTransport:    function () {
            var iCallback = arguments[arguments.length - 1];

            $_DOM.on('ajaxTransport',  function () {
                function iXHR() {}

                $.extend(iXHR.prototype, iCallback.apply(
                    BOM,  $.makeArray(arguments).slice(1)
                ), {
                    open:                function () { },
                    setRequestHeader:    function () { }
                });

                return iXHR;
            });
        },
        ajaxPrefilter:    function () {
            var iCallback = arguments[arguments.length - 1];

            $_DOM.on('ajaxPrefilter',  function () {
                iCallback.apply(BOM, $.makeArray(arguments).slice(1));
            });
        }
    });

    function HTTP_Request(iMethod, iURL, iData, iCallback) {
        var iOption = {
                type:           iMethod.toUpperCase(),
                url:            iURL,
                crossDomain:    $.isCrossDomain(iURL),
                data:           iData,
                success:        iCallback
            };

        var iXHR = new (
                $_DOM.triggerHandler('ajaxTransport', [
                    iOption, iOption, BOM.XMLHttpRequest
                ])  ||
                BOM.XMLHttpRequest
            )();

        $_DOM.triggerHandler('ajaxPrefilter',  [iOption, iOption, iXHR]);

        return  XD_Request.call(iXHR, iOption);
    }

    var HTTP_Method = $.makeSet('POST', 'PUT', 'DELETE');

    for (var iMethod in HTTP_Method)
        $[ iMethod.toLowerCase() ] = $.proxy(HTTP_Request, BOM, iMethod);

    $.getJSON = $.get = function (iURL, iData, iCallback) {
        if (typeof iData == 'function') {
            iCallback = iData;
            iData = { };
        }

        //  JSONP
        if ( iURL.match(/\w+=\?/) ) {
            var iDHR = new BOM.DOMHttpRequest();
            iDHR.open('GET', iURL);
            iDHR.onready = iCallback;
            return iDHR.send(iData);
        }

        //  XHR
        iData = $.extend($.paramJSON(iURL), iData);

        var File_Name = $.fileName(iURL);

        if (!  $.map($('link[rel="next"], link[rel="prefetch"]'),  function () {
            if ($.fileName( arguments[0].href )  ==  File_Name)
                return iURL;
        }).length)
            iData._ = $.now();

        return HTTP_Request(
            'GET',
            (iURL.split('?')[0] + '?' + $.param(iData)).trim('?'),
            null,
            iCallback
        );
    };

    /* ----- Smart HTML Loading ----- */
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