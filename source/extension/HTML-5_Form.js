define(['jquery'],  function ($) {

    var BOM = self,  DOM = self.document;

    if (! (($.browser.msie < 10)  ||  $.browser.ios))
        return;

/* ---------- Form Element API ---------- */

    function Value_Check() {
        var $_This = $(this);

        if ((typeof $_This.attr('required') == 'string')  &&  (! this.value))
            return false;

        var iRegEx = $_This.attr('pattern');
        if (iRegEx)  try {
            return  RegExp(iRegEx).test(this.value);
        } catch (iError) { }

        if ((this.tagName.toLowerCase() == 'input')  &&  (this.type == 'number')) {
            var iNumber = Number(this.value),
                iMin = Number( $_This.attr('min') );
            if (
                isNaN(iNumber)  ||
                (iNumber < iMin)  ||
                (iNumber > Number( $_This.attr('max') ))  ||
                ((iNumber - iMin)  %  Number( $_This.attr('step') ))
            )
                return false;
        }

        return true;
    }

    HTMLInputElement.prototype.checkValidity = Value_Check;
    HTMLSelectElement.prototype.checkValidity = Value_Check;
    HTMLTextAreaElement.prototype.checkValidity = Value_Check;

    HTMLFormElement.prototype.checkValidity = function () {
        var $_Input = $('*[name]:input', this);

        for (var i = 0;  i < $_Input.length;  i++)
            if (! $_Input[i].checkValidity())
                return false;
        return true;
    };

/* ---------- Form Data Object ---------- */

    if (! ($.browser.msie < 10))  return;

    BOM.FormData = function () {
        this.ownerNode = arguments[0];
    };

    $.extend(BOM.FormData.prototype, {
        append:      function () {
            this[ arguments[0] ] = arguments[1];
        },
        toString:    function () {
            return $(this.ownerNode).serialize();
        }
    });

});