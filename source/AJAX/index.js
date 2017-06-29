define([
    './ext/URL', '../DOM/ext/base', '../polyfill/Promise_A+', './ext/transport'
],  function ($) {

/* ---------- Response Data ---------- */

    var ResponseType = $.makeSet('html', 'xml', 'json');

    function AJAX_Complete(iResolve, iReject, iCode) {

        var iHeader = { };

        if (arguments[5])
            $.each(arguments[5].split("\r\n"),  function () {

                var _Header_ = $.split(this, /:\s+/, 2);

                iHeader[_Header_[0]] = _Header_[1];
            });

        var iType = (iHeader['Content-Type'] || '').split(';')[0].split('/');

        $.extend(this, {
            status:          iCode,
            statusText:      arguments[3],
            responseText:    arguments[4].text,
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

        if (iCode < 400)
            iResolve( this.response );
        else
            iReject( this.statusText );
    }

/* ---------- Request Core ---------- */

    var Default_Option = {
            type:        'GET',
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
        iURL = _Option_.url;

        _Option_.crossDomain = $.isCrossDomain( iURL );

        _Option_.url = iURL = iURL.replace(/&?(\w+)=\?/,  function () {

            if (_Option_.jsonp = arguments[1])  _Option_.dataType = 'jsonp';

            return '';
        });

        if (_Option_.type == 'GET') {

            if (!  (_Option_.jsonp  ||  hasFetched( iURL )))
                _Option_.data._ = $.now();

            _Option_.data = $.extend($.paramJSON( iURL ),  _Option_.data);

            _Option_.url = $.extendURL(iURL, _Option_.data);
        }

    //  Prefilter & Transport
        var iXHR = new self.XMLHttpRequest(),  iArgs = [_Option_, iOption, iXHR];

        $.ajaxPrefilter(_Option_.dataType, iArgs);

        iXHR = $.ajaxTransport(_Option_.dataType, iArgs)  ||  iXHR;

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

    return $.ajaxPatch();

});
