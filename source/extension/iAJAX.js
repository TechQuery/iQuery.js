define(['jquery'],  function ($) {

    var BOM = self,  DOM = self.document;

/* ---------- DOM HTTP Request ---------- */

    BOM.DOMHttpRequest = function () {
        this.status = 0;
        this.readyState = 0;
        this.responseType = 'text';
    };
    BOM.DOMHttpRequest.JSONP = { };

    var Success_State = {
            readyState:    4,
            status:        200,
            statusText:    'OK'
        };

    $.extend(BOM.DOMHttpRequest.prototype, {
        open:                function () {
            this.responseURL = arguments[1];
            this.readyState = 1;
        },
        setRequestHeader:    function () {
            console.warn("JSONP/iframe doesn't support Changing HTTP Headers...");
        },
        send:                function (iData) {
            var iDHR = this,  _UUID_ = $.uuid('DHR');

            this.$_Transport =
                (iData instanceof BOM.FormData)  &&  $(iData.ownerNode);

            if (this.$_Transport && (
                iData.ownerNode.method.toUpperCase() == 'POST'
            )) {
                //  <iframe />
                var iTarget = this.$_Transport.submit(function () {
                        if ( $(this).data('_AJAX_Submitting_') )  return false;
                    }).attr('target');

                if ((! iTarget)  ||  iTarget.match(/^_(top|parent|self|blank)$/i)) {
                    this.$_Transport.attr('target', _UUID_);
                    iTarget = _UUID_;
                }

                $('iframe[name="' + iTarget + '"]').sandBox(function () {
                    iDHR.$_Transport.data('_AJAX_Submitting_', 0);
                    try {
                        iDHR.responseText = $(this).contents().find('body').text();
                    } catch (iError) { }

                    $.extend(iDHR, Success_State, {
                        responseType:    'text',
                        response:        iDHR.responseText
                    });
                    iDHR.onload();
                }).attr('name', iTarget);

                this.$_Transport.submit();
            } else {
                //  <script />, JSONP
                var iURL = this.responseURL.match(/([^\?=&]+\?|\?)?(\w.+)?/);

                if (! iURL)  throw 'Illegal JSONP URL !';

                this.constructor.JSONP[_UUID_] = function (iJSON) {
                    $.extend(iDHR, Success_State, {
                        responseType:    'json',
                        response:        iJSON,
                        responseText:    JSON.stringify(iJSON)
                    });
                    iDHR.onload();

                    delete this[_UUID_];
                    iDHR.$_Transport.remove();
                };
                this.responseURL = iURL[1] + $.param(
                    $.extend(arguments[0] || { },  $.paramJSON(
                        '?' + iURL[2].replace(
                            /(\w+)=\?/,  '$1=DOMHttpRequest.JSONP.' + _UUID_
                        )
                    ))
                );
                this.$_Transport = $('<script />', {
                    type:       'text/javascript',
                    charset:    'UTF-8',
                    src:        this.responseURL
                }).appendTo(DOM.head);
            }

            this.readyState = 2;
        },
        abort:               function () {
            this.$_Transport = null;
            this.readyState = 0;
        }
    });

/* ---------- AJAX for IE 10- ---------- */

    $.ajaxTransport(function (iOption) {
        var iXHR;

        if (($.browser.msie < 10)  &&  iOption.crossDomain)
            return {
                send:     function (iHeader, iComplete) {
                    iXHR = new BOM.XDomainRequest();

                    iXHR.open(iOption.type, iOption.url, true);

                    iXHR.onload = function () {
                        iComplete(
                            200,
                            'OK',
                            {text:  iXHR.responseText},
                            'Content-Type: ' + iXHR.contentType
                        );
                    };
                    iXHR.onerror = function () {
                        iComplete(500, 'Internal Server Error', {
                            text:    iXHR.responseText
                        });
                    };
                    iXHR.send(iOption.data);
                },
                abort:    function () {
                    iXHR.abort();
                    iXHR = null;
                }
            };
    });

    function DHR_Transport(iOption) {
        var iXHR,  iForm = iOption.data.ownerNode;

        switch (true) {
            case (
                (iOption.data instanceof BOM.FormData)  &&
                $(iForm).is('form')  &&
                $('input[type="file"]', iForm)[0]
            ):
                break;
            case ($.fn.iquery  &&  (iOption.dataType == 'jsonp')):
                break;
            default:    return;
        }

        return {
            send:     function (iHeader, iComplete) {
                if (iOption.dataType == 'jsonp')
                    iOption.url += (iOption.url.split('?')[1] ? '&' : '?')  +
                        iOption.jsonp + '=?';

                iXHR = new BOM.DOMHttpRequest();
                iXHR.open(iOption.type, iOption.url);
                iXHR.onload = function () {
                    var iResponse = {text:  iXHR.responseText};
                    iResponse[ iXHR.responseType ] = iXHR.response;

                    iComplete(iXHR.status, iXHR.statusText, iResponse);
                };
                iXHR.send(iOption.data);
            },
            abort:    function () {
                iXHR.abort();
            }
        };
    }

    $.ajaxTransport(DHR_Transport);

    $.ajaxTransport('jsonp', DHR_Transport);

/* ---------- Form Element AJAX Submit ---------- */

    $.fn.ajaxSubmit = function (iCallback) {
        if (! this.length)  return this;

        function AJAX_Submit(iEvent) {
            var $_Form = $(this);

            if ((! this.checkValidity())  ||  $_Form.data('_AJAX_Submitting_'))
                return false;

            $_Form.data('_AJAX_Submitting_', 1);

            var iMethod = ($_Form.attr('method') || 'Get').toLowerCase();

            if (typeof $[iMethod] == 'function')
                $[iMethod](
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