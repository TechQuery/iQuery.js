define(['../iQuery', '../utility/ext/browser', '../DOM/utility'],  function ($) {

    if (! (($.browser.msie < 10)  ||  $.browser.ios))  return;

/* ---------- Placeholder ---------- */

    var _Value_ = {
            input:       Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype, 'value'
            ),
            textarea:    Object.getOwnPropertyDescriptor(
                HTMLTextAreaElement.prototype, 'value'
            )
        };
    function getValue() {

        return  _Value_[ this.tagName.toLowerCase() ].get.call( this );
    }

    function PH_Blur() {

        if (getValue.call( this ))  return;

        this.value = this.placeholder;

        this.style.color = 'gray';
    }

    function PH_Focus() {

        if (this.placeholder  ==  getValue.call( this ))
            this.value = this.style.color = '';
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
                    .focus( PH_Focus ).blur( PH_Blur );
            }
        };
    Object.defineProperty(
        HTMLInputElement.prototype, 'placeholder', iPlaceHolder
    );
    Object.defineProperty(
        HTMLTextAreaElement.prototype, 'placeholder', iPlaceHolder
    );

    $( document ).ready(function () {

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
                    (iValue == this.placeholder)  &&  (this.style.color === 'gray')
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


/* ---------- Form Data Object ---------- */

    if (! ($.browser.msie < 10))  return;

    function FormData() {

        this.ownerNode = arguments[0];
    }

    $.extend(FormData.prototype, {
        append:      function () {

            this[ arguments[0] ] = arguments[1];
        },
        toString:    function () {

            return  $( this.ownerNode ).serialize();
        }
    });

    self.FormData = FormData;

});