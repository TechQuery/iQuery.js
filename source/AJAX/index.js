define([
    './ext/URL', './ext/header', '../DOM/ext/base', '../polyfill/Promise_A+',
    './ext/transport'
],  function ($) {

/* ---------- Response Data ---------- */

    var ResponseType = $.makeSet('html', 'xml', 'json');

    function AJAX_Complete(resolve, reject, code, status, response, header) {

        header = $.parseHeader(header || '');

        var iType = (header['content-type'] || '').split(';')[0].split('/');

        $.extend(this, {
            status:          code,
            statusText:      status,
            responseText:    response.text,
            responseType:
                ((iType[1] in ResponseType) ? iType[1] : iType[0])  ||  'text'
        });

        this.response = this.responseText;

        switch ( this.responseType ) {
            case 'text':    ;
            case 'html':    if (this.responseText.match( /^\s*<.+?>/ )) {
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

        if (code < 400)
            resolve( this.response );
        else
            reject( this.statusText );
    }

/* ---------- Request Core ---------- */

    var Default_Option = {
            method:      'GET',
            dataType:    'text'
        },
        $_DOM = $( self.document );

    function hasFetched(iURL) {

        var File_Name = $.fileName( iURL );

        return  $('link[rel="next"], link[rel="prefetch"]').map(function () {

            if ($.fileName( this.href )  ==  File_Name)  return this;
        })[0];
    }

    function Complete_Event(iStatus, iOption) {

        $_DOM.trigger('ajaxComplete',  [this, iOption]);

        if (typeof iOption.complete == 'function')
            iOption.complete(this, iStatus);
    }

    $.ajax = function (iURL, iOption) {

        if ($.isPlainObject( iURL ))
            iOption = iURL;
        else {
            iOption = iOption || { };
            iOption.url = iURL;
        }

    //  Option Object
        var _Option_ = $.extend(
                {url: self.location.href},  Default_Option,  iOption
            );
        _Option_.method = (_Option_.type || _Option_.method).toUpperCase();

        iURL = _Option_.url;

        _Option_.crossDomain = $.isXDomain( iURL );

        _Option_.url = iURL = iURL.replace(/&?(\w+)=\?/,  function () {

            if (_Option_.jsonp = arguments[1])  _Option_.dataType = 'jsonp';

            return '';
        });

        if (_Option_.method === 'GET') {

            if (!  (_Option_.jsonp  ||  hasFetched( iURL )))
                _Option_.data._ = $.now();

            _Option_.data = $.extend($.paramJSON( iURL ),  _Option_.data);

            _Option_.url = $.extendURL(iURL, _Option_.data);

            _Option_.data = '';
        }

    //  Prefilter & Transport
        var iArgs = [_Option_, iOption, iXHR];

        $.ajaxPrefilter(_Option_.dataType, iArgs);

        var iXHR = $.ajaxTransport(_Option_.dataType, iArgs);

    //  Async Promise
        var iResult = new Promise(function (iResolve, iReject) {

                if (_Option_.timeout)
                    $.wait(_Option_.timeout / 1000,  function () {

                        iXHR.abort();

                        var iError = new Error('XMLHttpRequest Timeout');

                        iReject(iError);

                        $_DOM.trigger('ajaxError',  [iXHR, _Option_, iError]);
                    });

                iXHR.send({ },  $.proxy(AJAX_Complete, iXHR, iResolve, iReject));

                $_DOM.trigger('ajaxSend',  [iXHR, _Option_]);
            });

        iArgs = [iXHR, _Option_];

        iResult.then(function () {

            $_DOM.trigger('ajaxSuccess', iArgs);

            if (typeof _Option_.success == 'function')
                _Option_.success(arguments[0], 'success', iXHR);

            Complete_Event.call(iXHR, 'success', _Option_);

        },  function (iError) {

            $_DOM.trigger('ajaxError', iArgs.concat(iError));

            if (typeof _Option_.error == 'function')
                _Option_.error(iXHR, 'error', iError);

            Complete_Event.call(iXHR, 'error', _Option_);
        });

        return iResult;
    };

});
