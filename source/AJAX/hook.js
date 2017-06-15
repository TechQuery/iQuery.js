define(['../iQuery'],  function ($) {

/* ---------- Hook API ---------- */

    var AJAX_Hook = $.each(
            {
                Prefilter:  { },    Transport:  { }
            },
            function (hook, queue) {

                $['ajax' + hook] = function (type, callback) {

                    if (callback instanceof Array) {

                        queue = queue[type || '*'][0];

                        return  queue  &&  queue.apply(null, callback);
                    }

                    callback = callback || type;

                    type = (callback === type)  ?  '*'  :  (type || '');

                    if (typeof callback != 'function')  return;

                    var method = 'push';

                    if (type[0] === '+')
                        method = 'unshift',  type = type.slice(1);

                    (queue[type] = queue[type] || [ ])[method]( callback );
                };
            }
        );
/* ---------- Original XHR ---------- */

    $.ajaxTransport(function (iOption) {

        var iXHR;

        return {
            send:    function (iHeader, iComplete) {

                iXHR = new self.XMLHttpRequest();

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

                if ( iOption.xhrFields )  $.extend(iXHR, iOption.xhrFields);

                if (! iOption.crossDomain)
                    iOption.headers = $.extend(iOption.headers || { },  iHeader,  {
                        'X-Requested-With':    'XMLHttpRequest',
                        Accept:                '*/*'
                    });

                for (var iKey in iOption.headers)
                    iXHR.setRequestHeader(iKey,  iOption.headers[ iKey ]);

                var iData = iOption.data;

                if ((iData instanceof Array)  ||  $.isPlainObject( iData ))
                    iData = $.param( iData );

                if ((typeof iData == 'string')  ||  iOption.contentType)
                    iXHR.setRequestHeader('Content-Type', (
                        iOption.contentType || 'application/x-www-form-urlencoded'
                    ));

                iOption.data = iData;

                iXHR.send(iData);
            },
            abort:    function () {
                iXHR.onload = iXHR.onreadystatechange = null;

                iXHR.abort();  iXHR = null;
            }
        };
    });
});