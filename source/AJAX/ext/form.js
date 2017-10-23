define(['../../iQuery', '../index'],  function ($) {

/* ---------- Form Field Validation ---------- */

    function Value_Check() {

        if ((! this.value)  &&  (this.getAttribute('required') != null))
            return false;

        var iRegEx = this.getAttribute('pattern');

        if (iRegEx)  try {

            return  RegExp( iRegEx ).test( this.value );

        } catch (iError) { }

        if (
            (this.tagName.toLowerCase() === 'input')  &&
            (this.getAttribute('type') === 'number')
        ) {
            var iNumber = Number( this.value ),
                iMin = Number( this.getAttribute('min') );
            if (
                isNaN( iNumber )  ||
                (iNumber < iMin)  ||
                (iNumber > Number(this.getAttribute('max') || Infinity))  ||
                ((iNumber - iMin)  %  Number( this.getAttribute('step') ))
            )
                return false;
        }

        return true;
    }

    /**
     * 表单（项）校验
     *
     * @author   TechQuery
     *
     * @memberof $.prototype
     * @function validate
     *
     * @returns  {boolean}
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation|Form Validation}
     */

    $.fn.validate = function () {

        var $_Field = this.find(':field').addBack(':field').removeClass('invalid');

        for (var i = 0;  $_Field[i];  i++)
            if ((
                (typeof $_Field[i].checkValidity === 'function')  &&
                (! $_Field[i].checkValidity())
            )  ||  (
                ! Value_Check.call( $_Field[i] )
            )) {
                $_Field = $( $_Field[i] ).addClass('invalid');

                $_Field.scrollParents().eq(0).scrollTo( $_Field.focus() );

                return false;
            }

        return true;
    };

/* ---------- Form Element AJAX Submit ---------- */

    function AJAX_Submit(DataType, iCallback) {

        var $_Form = $( this );

        if ((! $_Form.validate())  ||  $_Form.data('_AJAX_Submitting_'))
            return false;

        $_Form.data('_AJAX_Submitting_', 1);

        var iMethod = ($_Form.attr('method') || 'Get').toLowerCase();

        arguments[0].preventDefault();

        var iOption = {
                type:        iMethod,
                dataType:    DataType || 'json'
            };

        if (! $_Form.find('input[type="file"]')[0])
            iOption.data = $_Form.serialize();
        else {
            iOption.data = new self.FormData( $_Form[0] );

            iOption.contentType = iOption.processData = false;
        }

        $.ajax(this.action, iOption).then(function () {

            $_Form.data('_AJAX_Submitting_', 0);

            if (typeof iCallback === 'function')
                iCallback.call($_Form[0], arguments[0]);
        });
    }

    $.fn.ajaxSubmit = function (DataType, iCallback) {

        if (! this[0])  return this;

        if (typeof DataType === 'function')
            iCallback = DataType,  DataType = '';

        iCallback = $.proxy(AJAX_Submit, null, DataType, iCallback);

        var $_This = (this.length < 2)  ?  this  :  this.sameParents().eq(0);

        if ($_This[0].tagName.toLowerCase() === 'form')
            $_This.submit( iCallback );
        else
            $_This.on('submit', 'form', iCallback);

        return this;
    };

});
