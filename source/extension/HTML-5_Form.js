define(['jquery'],  function ($) {

    var BOM = self,  DOM = self.document;

    if (! (($.browser.msie < 10)  ||  $.browser.ios))
        return;

/* ---------- Placeholder ---------- */

    var _Value_ = {
            INPUT:       Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype, 'value'
            ),
            TEXTAREA:    Object.getOwnPropertyDescriptor(
                HTMLTextAreaElement.prototype, 'value'
            )
        };
    function getValue() {
        return _Value_[this.tagName].get.call(this);
    }

    function PH_Blur() {
        if (getValue.call( this ))  return;

        this.value = this.placeholder;
        this.style.color = 'gray';
    }

    function PH_Focus() {
        if (this.placeholder != getValue.call(this))  return;

        this.value = '';
        this.style.color = '';
    }

    var iPlaceHolder = {
            get:    function () {
                return this.getAttribute('placeholder');
            },
            set:    function () {
                if ($.browser.modern)
                    this.setAttribute('placeholder', arguments[0]);

                PH_Blur.call(this);

                $(this).off('focus', PH_Focus).off('blur', PH_Blur)
                    .focus(PH_Focus).blur(PH_Blur);
            }
        };
    Object.defineProperty(
        HTMLInputElement.prototype, 'placeholder', iPlaceHolder
    );
    Object.defineProperty(
        HTMLTextAreaElement.prototype, 'placeholder', iPlaceHolder
    );

    $(DOM).ready(function () {
        $('input[placeholder], textarea[placeholder]')
            .prop('placeholder',  function () {
                return this.placeholder;
            });
    });

/* ---------- Field Value ---------- */

    var Value_Patch = {
            get:    function () {
                var iValue = getValue.call(this);

                return (
                    (iValue == this.placeholder)  &&  (this.style.color == 'gray')
                ) ?
                    '' : iValue;
            }/*,
            set:    function () {
                _Value_.set.call(this, arguments[0]);

                if (this.style.color == 'gray')  this.style.color = '';
            }*/
        };
    Object.defineProperty(HTMLInputElement.prototype, 'value', Value_Patch);
    Object.defineProperty(HTMLTextAreaElement.prototype, 'value', Value_Patch);


/* ---------- Form Element API ---------- */

    function Value_Check() {
        if ((! this[0].value)  &&  (this.attr('required') != null))
            return false;

        var iRegEx = this.attr('pattern');
        if (iRegEx)  try {
            return  RegExp( iRegEx ).test( this[0].value );
        } catch (iError) { }

        if ((this[0].tagName == 'INPUT')  &&  (this[0].type == 'number')) {
            var iNumber = Number( this[0].value ),
                iMin = Number( this.attr('min') );
            if (
                isNaN(iNumber)  ||
                (iNumber < iMin)  ||
                (iNumber > Number( this.attr('max') ))  ||
                ((iNumber - iMin)  %  Number( this.attr('step') ))
            )
                return false;
        }

        return true;
    }

    var Invalid_Event = {
            type:          'invalid',
            bubbles:       false,
            cancelable:    false
        };

    function Check_Wrapper() {
        var $_This = $(this);

        if (Value_Check.apply($_This, arguments))  return true;

        return  (! $_This.trigger(Invalid_Event));
    }

    HTMLInputElement.prototype.checkValidity = Check_Wrapper;
    HTMLSelectElement.prototype.checkValidity = Check_Wrapper;
    HTMLTextAreaElement.prototype.checkValidity = Check_Wrapper;

    HTMLFormElement.prototype.checkValidity = function () {
        if (this.getAttribute('novalidate') != null)  return true;

        var $_Input = $('*[name]:input', this);

        for (var i = 0;  i < $_Input.length;  i++)
            if (! $_Input[i].checkValidity()) {
                $_Input[i].style.borderColor = 'red';

                $.wait(1,  function () {
                    $_Input[i].style.borderColor = '';
                });

                return  (! $(this).trigger(Invalid_Event));
            }

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