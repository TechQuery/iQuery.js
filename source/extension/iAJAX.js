define(['jquery'],  function ($) {

    var BOM = self,  DOM = self.document;

/* ---------- DOM HTTP Request ---------- */

    BOM.DOMHttpRequest = function () {
        this.status = 0;
        this.readyState = 0;
        this.responseType = 'text';
    };

    var Success_State = {
            readyState:    4,
            status:        200,
            statusText:    'OK'
        };

    function Allow_Send() {
        return  (this.readyState == 1)  ||  (this.readyState == 4);
    }

    function iFrame_Send() {
        var iDHR = this,
            iTarget = this.$_Transport.submit(
                $.proxy(Allow_Send, this)
            ).attr('target');

        if ((! iTarget)  ||  iTarget.match(/^_(top|parent|self|blank)$/i)) {
            iTarget = $.uuid('DHR');
            this.$_Transport.attr('target', iTarget);
        }

        $('iframe[name="' + iTarget + '"]').sandBox(function () {

            $.extend(iDHR, Success_State, {
                responseType:    'text',
                response:        iDHR.responseText =
                    $(this).contents().find('body').text()
            });

            iDHR.onload();

            return false;

        }).attr('name', iTarget);

        this.$_Transport.submit();
    }

    var JSONP_Map = { };

    BOM.DOMHttpRequest.JSONP = function (iData) {
        iData = $.extend({
            responseType:    'json',
            response:        iData,
            responseText:    JSON.stringify( iData )
        }, Success_State);

        var iDHR = JSONP_Map[
                DOM.currentScript.src.replace(/&?\w+?=DOMHttpRequest\.JSONP/, '')
            ];

        for (var i = 0;  iDHR[i];  i++) {

            $.extend(iDHR[i], iData).onload();

            iDHR[i].$_Transport.remove();
        }

        iDHR.length = 0;
    };

    function Script_Send() {
        this.responseURL = $.extendURL(
            this.responseURL.replace(/(\w+)=\?/, '$1=DOMHttpRequest.JSONP'),
            arguments[0]
        );

        this.$_Transport = $('<script />', {
            type:       'text/javascript',
            charset:    'UTF-8',
            src:        this.responseURL
        }).appendTo( DOM.head );

        var iURL = this.$_Transport[0].src;

        iURL = iURL.split('?')[0] + '?' + $.paramSign(
            iURL.replace(/&?\w+?=DOMHttpRequest\.JSONP/, '')
        );
        (JSONP_Map[iURL] = JSONP_Map[iURL]  ||  [ ]).push( this );
    }

    $.extend(BOM.DOMHttpRequest.prototype, {
        open:                function () {
            this.responseURL = arguments[1];
            this.readyState = 1;
        },
        setRequestHeader:    function () {
            console.warn("JSONP/iframe doesn't support Changing HTTP Headers...");
        },
        send:                function (iData) {
            if (! Allow_Send.call(this))  return;

            this.$_Transport =
                (iData instanceof BOM.FormData)  &&  $(iData.ownerNode);

            if (this.$_Transport && (
                iData.ownerNode.method.toUpperCase() == 'POST'
            ))
                iFrame_Send.call( this );
            else
                Script_Send.call(this, iData);

            this.readyState = 2;
        },
        abort:               function () {
            this.$_Transport = null;
            this.readyState = 0;
        }
    });

/* ---------- AJAX for IE 10- ---------- */

    function DHR_Transport(iOption) {
        var iXHR;

        return  (iOption.dataType == 'jsonp')  &&  {
            send:     function (iHeader, iComplete) {
                if (! $.fn.iquery) {
                    iOption.url = iOption.url.replace(
                        RegExp('&?' + iOption.jsonp + '=\\w+'),  ''
                    ).trim('?');

                    iOption.dataTypes.shift();
                }
                iOption.url += (iOption.url.split('?')[1] ? '&' : '?')  +
                    iOption.jsonp + '=?';

                iXHR = new BOM.DOMHttpRequest();

                iXHR.open(iOption.type, iOption.url);

                iXHR.onload = function () {
                    var iResponse = {text:  this.responseText};
                    iResponse[ this.responseType ] = this.response;

                    iComplete(this.status, this.statusText, iResponse);
                };
                iXHR.send( iOption.data );
            },
            abort:    function () {
                iXHR.abort();
            }
        };
    }

    //  JSONP for iQuery
    $.ajaxTransport('+script', DHR_Transport);

    if ($.browser.msie < 10)
        $.ajaxTransport('+*',  function (iOption) {
            var iXHR,  iForm = (iOption.data || '').ownerNode;

            if (
                (iOption.data instanceof BOM.FormData)  &&
                $(iForm).is('form')  &&
                $('input[type="file"]', iForm)[0]
            )
                return DHR_Transport(iOption);

            return  iOption.crossDomain && {
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

/* ---------- Form Field Validation ---------- */

    function Value_Check() {
        if ((! this.value)  &&  (this.getAttribute('required') != null))
            return false;

        var iRegEx = this.getAttribute('pattern');
        if (iRegEx)  try {
            return  RegExp( iRegEx ).test( this.value );
        } catch (iError) { }

        if (
            (this.tagName == 'INPUT')  &&
            (this.getAttribute('type') == 'number')
        ) {
            var iNumber = Number( this.value ),
                iMin = Number( this.getAttribute('min') );
            if (
                isNaN(iNumber)  ||
                (iNumber < iMin)  ||
                (iNumber > Number(this.getAttribute('max') || Infinity))  ||
                ((iNumber - iMin)  %  Number( this.getAttribute('step') ))
            )
                return false;
        }

        return true;
    }

    $.fn.validate = function () {
        var $_Field = this.find(':field').removeClass('invalid');

        for (var i = 0;  $_Field[i];  i++)
            if ((
                (typeof $_Field[i].checkValidity == 'function')  &&
                (! $_Field[i].checkValidity())
            )  ||  (
                ! Value_Check.call( $_Field[i] )
            )) {
                $_Field = $( $_Field[i] ).addClass('invalid');

                $_Field.scrollParents().eq(0).scrollTo( $_Field.focus() );

                return false;
            }

        return true;
    };

/* ---------- Form Element AJAX Submit ---------- */

    $.fn.ajaxSubmit = function (DataType, iCallback) {
        if (! this[0])  return this;

        if (typeof DataType == 'function') {
            iCallback = DataType;
            DataType = '';
        }

        function AJAX_Submit() {
            var $_Form = $(this);

            if ((! $_Form.validate())  ||  $_Form.data('_AJAX_Submitting_'))
                return false;

            $_Form.data('_AJAX_Submitting_', 1);

            var iMethod = ($_Form.attr('method') || 'Get').toLowerCase();

            if (typeof $[iMethod] != 'function')  return;

            arguments[0].preventDefault();

            var iOption = {
                    type:        iMethod,
                    dataType:    DataType || 'json'
                };

            if (! $_Form.find('input[type="file"]')[0])
                iOption.data = $_Form.serialize();
            else {
                iOption.data = new BOM.FormData( $_Form[0] );
                iOption.contentType = iOption.processData = false;
            }

            $.ajax(this.action, iOption).then(function () {
                $_Form.data('_AJAX_Submitting_', 0);

                if (typeof iCallback == 'function')
                    iCallback.call($_Form[0], arguments[0]);
            });
        }

        var $_This = (this.length < 2)  ?  this  :  this.sameParents().eq(0);

        if ($_This[0].tagName == 'FORM')
            $_This.submit( AJAX_Submit );
        else
            $_This.on('submit', 'form', AJAX_Submit);

        return this;
    };

});
