define(['iEvent'],  function ($) {

    var BOM = self,  DOM = self.document;

    /* ----- XML HTTP Request ----- */

    function onLoad(iProperty, iData) {
        if (iProperty)  $.extend(this, iProperty);

        if (! (this.option.crossDomain || (this.readyState == 4)))
            return;

        var iError = (this.status > 399),  iArgs = [this, this.option];

        $_DOM.trigger('ajaxComplete', iArgs);
        $_DOM.trigger('ajax' + (iError ? 'Error' : 'Success'),  iArgs);

        if (typeof this.onready != 'function')  return;

        this.onready(
            iData || this.responseAny(),  iError ? 'error' : 'success',  this
        );
    }

    var Success_State = {
            readyState:    4,
            status:        200,
            statusText:    'OK'
        },
        $_DOM = $(DOM);

    function XD_Request(iData) {
        var iOption = this.option;

        this.open.call(this, iOption.type, iOption.url, true);

        this[this.option.crossDomain ? 'onload' : 'onreadystatechange'] = $.proxy(
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

        this.option.data = iData;

        $_DOM.trigger('ajaxSend',  [this, this.option]);

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

    if ($.browser.msie < 10)
        $.extend(BOM.XDomainRequest.prototype, XHR_Extension, {
            setRequestHeader:    function () {
                console.warn("IE 8/9 XDR doesn't support Changing HTTP Headers...");
            }
        });

    function X_Domain() {
        var iDomain = $.urlDomain( arguments[0] );

        return  iDomain && (
            iDomain != [
                BOM.location.protocol, '//', DOM.domain, (
                    BOM.location.port  ?  (':' + BOM.location.port)  :  ''
                )
            ].join('')
        );
    }

    $.ajaxPrefilter = function (iFilter) {
        if (typeof iFilter == 'function')
            $_DOM.on('ajaxPrefilter',  function (iEvent, iXHR) {
                iFilter(iXHR.option, iXHR.option, iXHR);
            });
    };

    function beforeOpen(iMethod, iURL, iData) {
        this.option = {
            type:           iMethod.toUpperCase(),
            url:            iURL,
            crossDomain:    X_Domain(iURL),
            data:           iData
        };
        $_DOM.triggerHandler('ajaxPrefilter', [this]);
    }

    /* ----- DOM HTTP Request ----- */
    BOM.DOMHttpRequest = function () {
        this.status = 0;
        this.readyState = 0;
        this.responseType = 'text/plain';
    };
    BOM.DOMHttpRequest.JSONP = { };

    $.extend(BOM.DOMHttpRequest.prototype, XHR_Extension, {
        open:                function (iMethod, iTarget) {
            //  <script />, JSONP
            if (iMethod.match(/^Get$/i)) {
                beforeOpen.apply(this, arguments);
                this.responseURL = this.option.url;
                return;
            }

            //  <iframe />
            var $_Form = $(iTarget).submit(function () {
                    if ( $(this).data('_AJAX_Submitting_') )  return false;
                }),
                iDHR = this;

            beforeOpen.call(this, iMethod, $_Form[0].action);

            $_Form[0].action = this.responseURL = this.option.url;

            var iTarget = $_Form.attr('target');

            if ((! iTarget)  ||  iTarget.match(/^_(top|parent|self|blank)$/i)) {
                iTarget = $.uuid('iframe');
                $_Form.attr('target', iTarget);
            }

            $('iframe[name="' + iTarget + '"]').sandBox(function () {
                $(this).on('load',  function () {
                    $_Form.data('_AJAX_Submitting_', 0);

                    if (iDHR.readyState)  try {
                        onLoad.call(iDHR, $.extend({
                            responseText:
                                $(this).contents().find('body').text()
                        }, Success_State));
                    } catch (iError) { }
                });
            }).attr('name', iTarget);

            this.$_DOM = $_Form;
        },
        send:                function () {
            $_DOM.trigger('ajaxSend',  [this, this.option]);

            if (this.option.type == 'POST')
                this.$_DOM.submit();    //  <iframe />
            else {
                //  <script />, JSONP
                var iURL = this.responseURL.match(/([^\?=&]+\?|\?)?(\w.+)?/);
                if (! iURL)  throw 'Illegal URL !';

                var _UUID_ = $.uuid(),  iDHR = this;

                BOM.DOMHttpRequest.JSONP[_UUID_] = function () {
                    if (iDHR.readyState)
                        onLoad.call(iDHR, Success_State, arguments[0]);
                    delete this[_UUID_];
                    iDHR.$_DOM.remove();
                };
                this.option.data = arguments[0];
                this.responseURL = iURL[1] + $.param(
                    $.extend({ }, arguments[0], $.paramJSON(
                        '?' + iURL[2].replace(
                            /(\w+)=\?/,  '$1=DOMHttpRequest.JSONP.' + _UUID_
                        )
                    ))
                );
                this.$_DOM = $('<script />',  {src: this.responseURL})
                    .appendTo(DOM.head);
            }
            this.readyState = 1;
        },
        setRequestHeader:    function () {
            console.warn("JSONP/iframe doesn't support Changing HTTP Headers...");
        },
        abort:               function () {
            this.readyState = 0;
        }
    });

    /* ----- HTTP Wraped Method ----- */
    function HTTP_Request(iMethod, iURL, iData, iCallback) {
        var iXHR = BOM[
                (X_Domain(iURL) && ($.browser.msie < 10))  ?  'XDomainRequest' : 'XMLHttpRequest'
            ];

        if ($.Type(iData) == 'HTMLElement') {
            var $_Form = $(iData);
            iData = { };

            if ($_Form[0].tagName.toLowerCase() == 'form') {
                if (! $_Form.find('input[type="file"]').length)
                    iData = $.paramJSON('?' + $_Form.serialize());
                else if (! ($.browser.msie < 10))
                    iData = new FormData($_Form[0]);
                else
                    iXHR = BOM.DOMHttpRequest;
            }
        }
        iXHR = new iXHR();
        iXHR.onready = iCallback;

        beforeOpen.call(
            iXHR,  iMethod,  ((! iData) && $_Form)  ?  $_Form  :  iURL,  iData
        );
        return  XD_Request.call(iXHR, iXHR.option.data);
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

    /* ----- Form Element AJAX Submit ----- */

    $.fn.ajaxSubmit = function (iCallback) {
        if (! this.length)  return this;

        function AJAX_Submit(iEvent) {
            var $_Form = $(this);

            if ((! this.checkValidity())  ||  $_Form.data('_AJAX_Submitting_'))
                return false;

            $_Form.data('_AJAX_Submitting_', 1);

            var iMethod = ($_Form.attr('method') || 'Get').toUpperCase();

            if ((iMethod in HTTP_Method)  ||  (iMethod == 'GET'))
                $[ iMethod.toLowerCase() ](
                    this.action,
                    $.paramJSON('?' + $_Form.serialize()),
                    function () {
                        $_Form.data('_AJAX_Submitting_', 0);
                        iCallback.apply($_Form[0], arguments);
                    }
                );
            return false;
        }

        var $_Form = this.filter('form');

        if ( $_Form[0] )
            $_Form.submit(AJAX_Submit);
        else
            this.on('submit', 'form:visible', AJAX_Submit);

        return this;
    };

});