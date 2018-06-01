define([
    '../../iQuery', '../../utility/ext/browser', '../../object/ext/Class',
    '../../DOM/insert', '../../CSS/ext/pseudo', '../../DOM/utility'
],  function ($) {

/* ---------- Form Data Object ---------- */

    if (! ($.browser.msie < 10))  return;

    function FormData() {

        this.setPrivate(
            'owner',
            arguments[0] ||
                $('<form style="display: none" />').appendTo( document.body )[0]
        );
    }

    function itemOf() {

        return  $('[name="' + arguments[0] + '"]:field',  this.__owner__);
    }

    $.Class.extend(FormData, null, {
        append:      function (name, value) {

            $('<input />', {
                type:     'hidden',
                name:     name,
                value:    value
            }).appendTo( this.__owner__ );
        },
        'delete':    function (name) {

            itemOf.call(this, name).remove();
        },
        set:         function (name, value) {

            this['delete']( name );    this.append(name, value);
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

            return  $( this.__owner__ ).serialize();
        },
        entries:     function () {

            return $.makeIterator(Array.from(
                $( this.__owner__ ).serializeArray(),  function (_This_) {

                    return  [_This_.name, _This_.value];
                }
            ));
        }
    });

    self.FormData = FormData;

});
