define(['jquery'],  function ($) {

    var BOM = self,  DOM = self.document;

/* ---------- DOM HTTP Request ---------- */

    BOM.DOMHttpRequest = function () {
        this.status = 0;
        this.readyState = 0;
        this.responseType = 'text/plain';
    };
    BOM.DOMHttpRequest.JSONP = { };

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

                    if (iDHR.readyState)  try {
                        iDHR.onload($.extend({
                            responseText:    $(this).contents().find('body').text()
                        }, Success_State));
                    } catch (iError) { }
                }).attr('name', iTarget);

                this.$_Transport.submit();
            } else {
                //  <script />, JSONP
                var iURL = this.responseURL.match(/([^\?=&]+\?|\?)?(\w.+)?/)  ||
                        throw 'Illegal JSONP URL !';

                this.constructor.JSONP[_UUID_] = function () {
                    if (iDHR.readyState)
                        iDHR.onload(Success_State, arguments[0]);
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
                this.$_Transport = $('<script />',  {src: this.responseURL})
                    .appendTo(DOM.head);
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
        var iXHR,  $_Form = $(iOption.data.ownerNode);

        if (! (
            ($.browser.msie < 10)  &&
            (iOption.data instanceof BOM.FormData)  &&
            $_Form.is('form')
        ))
            return;

        if (! $_Form.find('input[type="file"]')[0])
            return {
                send:     function () {
                    iXHR = new BOM.XDomainRequest();
                    iXHR.open(iOption.method, iOption.url);
                    iXHR;
                    iXHR.send(iOption.data);
                },
                abort:    function () {
                    iXHR.abort();
                }
            };

        return {
            send:     function () {
                iXHR = new BOM.DOMHttpRequest();
                iXHR.open(iOption.method, iOption.url);
                iXHR.onready = iCallback;
                iXHR.send(iOption.data);
            },
            abort:    function () {
                iXHR.abort();
            }
        };
    });

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