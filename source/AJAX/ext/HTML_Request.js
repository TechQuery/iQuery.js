define([
    './URL', '../../event/wrapper', '../../polyfill/HTML-5_Form'
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

        var HHR = this,
            target = this.$_Transport.submit(
                $.proxy(Allow_Send, this)
            ).attr('target');

        if ((! target)  ||  target.match( /^_(top|parent|self|blank)$/i )) {

            target = $.uuid('HHR');

            this.$_Transport.attr('target', target);
        }

        var $_Target = $('iframe[name="' + target + '"]');

        if (! $_Target[0])
            $_Target = $('<iframe />',  {
                name:     target,
                style:    'display: none'
            }).appendTo('body');

        $_Target.on('load',  function () {

            var _DOM_ = this.contentWindow.document;

            $.extend(HHR, Success_State, {
                responseHeader:    {
                    'Set-Cookie':      _DOM_.cookie,
                    'Content-Type':
                        _DOM_.contentType + '; charset=' + _DOM_.charset
                },
                responseType:      'text',
                response:          HHR.responseText = $(_DOM_.body).text()
            });

            HHR.onload();
        });

        this.$_Transport.submit();
    }

    var JSONP_Map = { };

    HTMLHttpRequest.JSONP = function (data) {

        var _This_ = document.currentScript;

        data = $.extend({
            responseHeader:    {
                'Content-Type':    _This_.type + '; charset=' + _This_.charset
            },
            responseType:      'json',
            response:          data,
            responseText:      JSON.stringify( data )
        }, Success_State);

        var HHR = JSONP_Map[ _This_.src ];

        for (var i = 0;  HHR[i];  i++)  if ( HHR[i].$_Transport ) {

            $.extend(HHR[i], data).onload();

            HHR[i].$_Transport.remove();
        }

        HHR.length = 0;
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

        var URI = this.$_Transport[0].src;

        (JSONP_Map[ URI ] = JSONP_Map[ URI ]  ||  [ ]).push( this );
    }

    $.extend(HTMLHttpRequest.prototype, {
        open:                     function () {
            this.responseURL = arguments[1];

            this.readyState = 1;
        },
        send:                     function (data) {

            if (! Allow_Send.call( this ))  return;

            this.$_Transport =
                (data instanceof self.FormData)  &&  $( data.__owner__ );

            if (this.$_Transport && (
                data.__owner__.method.toUpperCase() === 'POST'
            ))
                iFrame_Send.call( this );
            else
                Script_Send.call(this, data);

            this.readyState = 2;
        },
        abort:                    function () {
            this.$_Transport.remove();

            this.$_Transport = null;

            this.readyState = 0;
        },
        setRequestHeader:         function () {

            console.warn("JSONP/iframe doesn't support Changing HTTP Headers...");
        },
        getResponseHeader:        function () {

            return  this.responseHeader[ arguments[0] ]  ||  null;
        },
        getAllResponseHeaders:    function () {

            return Array.from(
                Object.keys( this.responseHeader ),
                function (key) {

                    return  key.toLowerCase()  +  ': '  +  this[ key ];
                },
                this.responseHeader
            ).join("\r\n");
        }
    });

    return  self.HTMLHttpRequest = HTMLHttpRequest;

});
