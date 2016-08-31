define(['iEvent'],  function ($) {

    var BOM = self,  DOM = self.document;


/* ---------- Custom API ---------- */

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


/* ---------- Original XHR ---------- */

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
            case 'html':    if (this.responseText.match(/^\s*<.+?>/)) {
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
        };

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
        var _Option_ = $.extend({
                url:    BOM.location.href
            }, Default_Option, iOption);

        iURL = _Option_.url;

        _Option_.crossDomain = $.isCrossDomain(iURL);

        _Option_.url = iURL = iURL.replace(/&?(\w+)=\?/,  function () {
            if (_Option_.jsonp = arguments[1])  _Option_.dataType = 'jsonp';

            return '';
        });

        if (_Option_.type == 'GET') {
            var File_Name = $.fileName(iURL);

            if (!  (_Option_.jsonp || $.browser.modern || $.map(
                $('link[rel="next"], link[rel="prefetch"]'),
                function () {
                    if ($.fileName( arguments[0].href )  ==  File_Name)
                        return iURL;
                }
            ).length))
                _Option_.data._ = $.now();

            _Option_.data = $.extend($.paramJSON(iURL), _Option_.data);

            _Option_.url = $.extendURL(iURL, _Option_.data);
        }

    //  Prefilter & Transport
        var iXHR = new BOM.XMLHttpRequest(),  iArgs = [_Option_, iOption, iXHR];

        iAJAX.trigger('prefilter', iArgs);

        iXHR = iAJAX.trigger('transport', _Option_.dataType, iArgs).slice(-1)[0];

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
