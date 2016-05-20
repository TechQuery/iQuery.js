define(['jquery'],  function ($) {

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