define([
    './URL', '../../event/wrapper', '../../DOM/ext/utility',
    '../../event/wrapper', '../../polyfill/HTML-5_Form'
],  function ($) {

    function HTMLHttpRequest() {

        this.status = 0;

        this.readyState = 0;

        this.responseType = 'text';
    }

    var Success_State = {
            readyState:    4,
            status:        200,
            statusText:    'OK'
        },
        Fail_State = {
            readyState:    4,
            status:        500,
            statusText:    'Internal Server Error'
        };

    function Allow_Send() {
        return  (this.readyState == 1)  ||  (this.readyState == 4);
    }

    function iFrame_Send() {

        var iHHR = this,
            iTarget = this.$_Transport.submit(
                $.proxy(Allow_Send, this)
            ).attr('target');

        if ((! iTarget)  ||  iTarget.match( /^_(top|parent|self|blank)$/i )) {

            iTarget = $.uuid('HHR');

            this.$_Transport.attr('target', iTarget);
        }

        $('iframe[name="' + iTarget + '"]').sandBox(function () {

            var _DOM_ = this.contentWindow.document;

            $.extend(iHHR, Success_State, {
                responseHeader:    {
                    'Set-Cookie':      _DOM_.cookie,
                    'Content-Type':
                        _DOM_.contentType + '; charset=' + _DOM_.charset
                },
                responseType:      'text',
                response:          iHHR.responseText =
                    $( this ).contents().find('body').text()
            });

            iHHR.onload();

            return false;

        }).attr('name', iTarget);

        this.$_Transport.submit();
    }

    var JSONP_Map = { };

    HTMLHttpRequest.JSONP = function (iData) {

        var _This_ = document.currentScript;

        iData = $.extend({
            responseHeader:    {
                'Content-Type':    _This_.type + '; charset=' + _This_.charset
            },
            responseType:      'json',
            response:          iData,
            responseText:      JSON.stringify( iData )
        }, Success_State);

        var iHHR = JSONP_Map[ _This_.src ];

        for (var i = 0;  iHHR[i];  i++)  if ( iHHR[i].$_Transport ) {

            $.extend(iHHR[i], iData).onload();

            iHHR[i].$_Transport.remove();
        }

        iHHR.length = 0;
    };

    function Script_Send() {

        this.responseURL = $.extendURL(
            this.responseURL.replace(/(\w+)=\?/, '$1=HTMLHttpRequest.JSONP'),
            arguments[0]
        );

        this.$_Transport = $('<script />', {
            type:       'text/javascript',
            charset:    'UTF-8',
            src:        this.responseURL
        }).on('error',  $.proxy(this.onerror, $.extend(this, Fail_State, {
            responseType:    'text',
            response:        '',
            responseText:    ''
        }))).appendTo('head');

        var iURL = this.$_Transport[0].src;

        (JSONP_Map[iURL] = JSONP_Map[iURL]  ||  [ ]).push( this );
    }

    $.extend(HTMLHttpRequest.prototype, {
        open:                 function () {
            this.responseURL = arguments[1];

            this.readyState = 1;
        },
        send:                 function (iData) {

            if (! Allow_Send.call( this ))  return;

            this.$_Transport =
                (iData instanceof self.FormData)  &&  $( iData.ownerNode );

            if (this.$_Transport && (
                iData.ownerNode.method.toUpperCase() === 'POST'
            ))
                iFrame_Send.call( this );
            else
                Script_Send.call(this, iData);

            this.readyState = 2;
        },
        abort:                function () {
            this.$_Transport.remove();

            this.$_Transport = null;

            this.readyState = 0;
        },
        setRequestHeader:     function () {

            console.warn("JSONP/iframe doesn't support Changing HTTP Headers...");
        },
        getResponseHeader:    function () {

            return  this.responseHeader[ arguments[0] ]  ||  null;
        }
    });

    return  self.HTMLHttpRequest = HTMLHttpRequest;

});