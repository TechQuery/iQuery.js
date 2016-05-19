define(['jquery'],  function ($) {

/* ---------- RESTful API ---------- */

    function HTTP_Request(iMethod, iURL, iData, iCallback) {
        if (typeof iData == 'function') {
            iCallback = iData;
            iData = null;
        }
        return  $.ajax({
            method:         iMethod,
            url:            iURL,
            data:           iData,
            complete:       iCallback,
            crossDomain:    true
        });
    }

    if (! $.fn.iquery) {
        var HTTP_Method = $.makeSet('PUT', 'DELETE');

        for (var iMethod in HTTP_Method)
            $[ iMethod.toLowerCase() ] = $.proxy(HTTP_Request, BOM, iMethod);
    }

/* ---------- Form Element AJAX Submit ---------- */

    $.fn.ajaxSubmit = function (iCallback) {
        if (! this.length)  return this;

        function AJAX_Submit(iEvent) {
            var $_Form = $(this);

            if ((! this.checkValidity())  ||  $_Form.data('_AJAX_Submitting_'))
                return false;

            $_Form.data('_AJAX_Submitting_', 1);

            if (
                $_Form.find('input[type="file"]').length &&
                ($.browser.msie < 10)
            ) {
                var iDHR = new BOM.DOMHttpRequest();
                iDHR.open('POST', $_Form)
                iDHR.onready = iCallback;
                iDHR.send();
                return;
            }

            var iMethod = ($_Form.attr('method') || 'Get').toUpperCase();

            if ((iMethod in HTTP_Method)  ||  (iMethod == 'GET'))
                $[ iMethod.toLowerCase() ](
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