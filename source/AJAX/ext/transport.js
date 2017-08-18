define([
    '../../iQuery', './HTML_Request', '../hook'
],  function ($, HTMLHttpRequest) {

    var BOM = self;

/* ---------- Cacheable JSONP ---------- */

    function HHR_Transport(iOption, iOrigin) {

        if (iOption.dataType != 'jsonp')  return;

        iOption.cache = ('cache' in iOrigin)  ?  iOrigin.cache  :  true;

        if ( iOption.cache )  iOption.url = iOption.url.replace(/&?_=\d+/, '');

        if ($.Type( this )  !=  'iQuery') {

            iOption.url = iOption.url.replace(
                RegExp('&?' + iOption.jsonp + '=\\w+'),  ''
            ).trim('?');

            iOption.dataTypes.shift();
        }

        var iXHR;

        return {
            send:     function (iHeader, iComplete) {

                iOption.url += (iOption.url.split('?')[1] ? '&' : '?')  +
                    iOption.jsonp + '=?';

                iXHR = new HTMLHttpRequest();

                iXHR.open(iOption.type, iOption.url);

                iXHR.onload = iXHR.onerror = function () {

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
/* ---------- Cross Domain XHR (IE 10-) ---------- */

    $.ajaxTransport('+script',  $.proxy(HHR_Transport, $));

    if (! (BOM.XDomainRequest instanceof Function))  return;


    $.ajaxTransport('+*',  function (iOption) {

        var iXHR,  iForm = (iOption.data || '').__owner__;

        if (
            (iOption.data instanceof BOM.FormData)  &&
            $( iForm ).is('form')  &&
            $('input[type="file"]', iForm)[0]
        )
            return  HHR_Transport.call($, iOption);

        return  iOption.crossDomain && {
            send:     function (iHeader, iComplete) {

                iXHR = new BOM.XDomainRequest();

                iXHR.open(iOption.type, iOption.url, true);

                $.extend(iXHR, {
                    timeout:      iOption.timeout || 0,
                    onload:       function () {
                        iComplete(
                            200,
                            'OK',
                            {text:  iXHR.responseText},
                            'Content-Type: ' + iXHR.contentType
                        );
                    },
                    onerror:      function () {

                        iComplete(500, 'Internal Server Error', {
                            text:    iXHR.responseText
                        });
                    },
                    ontimeout:    $.proxy(
                        iComplete,  null,  504,  'Gateway Timeout'
                    )
                });

                iXHR.send( iOption.data );
            },
            abort:    function () {

                iXHR.abort();    iXHR = null;
            }
        };
    });
});