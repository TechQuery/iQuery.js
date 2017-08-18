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
            get:           function () {

                return this.getAttribute('placeholder');
            },
            set:           function () {

                if ($.browser.modern)
                    this.setAttribute('placeholder', arguments[0]);

                PH_Blur.call(this);

                $(this).off('focus', PH_Focus).off('blur', PH_Blur)
                    .focus( PH_Focus ).blur( PH_Blur );
            },
            enumerable:    true
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
            get:           function () {

                var iValue = getValue.call( this );

                return (
                    (iValue == this.placeholder)  &&  (this.style.color === 'gray')
                ) ?
                    '' : iValue;
            },
            enumerable:    true/*,
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

        this.ownerNode = arguments[0] ||
            $('<form style="display: none" />').appendTo( document.body )[0];
    }

    function itemOf() {

        return  $('[name="' + arguments[0] + '"]:field',  this.ownerNode);
    }

    $.extend(FormData.prototype, {
        append:      function (name, value) {

            $('<input />', {
                type:     'hidden',
                name:     name,
                value:    value
            }).appendTo( this.ownerNode );
        },
        delete:      function (name) {

            itemOf.call(this, name).remove();
        },
        set:         function (name, value) {

            this.delete( name );    this.append(name, value);
        },
        get:         function (name) {

            return  itemOf.call(this, name).val();
        },
        getAll:      function (name) {

            return  $.map(itemOf.call(this, name),  function () {

                return arguments[0].value;
            });
        },
        toString:    function () {

            return  $( this.ownerNode ).serialize();
        },
        entries:     function () {

            return $.makeIterator(Array.from(
                $( this.ownerNode ).serializeArray(),  function (_This_) {

                    return  [_This_.name, _This_.value];
                }
            ));
        }
    });

    self.FormData = FormData;

});