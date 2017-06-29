define(['../iQuery', '../polyfill/IE-8'],  function ($) {

    function Event(type, property) {

        if (type instanceof Event)
            return  $.isPlainObject( property )  ?
                $.extend(type, property)  :  type;

        if (! (this instanceof Event))  return  new Event(type, property);


        if ($.isPlainObject( type )) {

            type = type.type;    $.extend(this, type);

        } else if (type instanceof self.Event) {

            this.originalEvent = type;    type = this.originalEvent.type;

            property = $.extend(property, this.originalEvent.valueOf());
        }

        $.extend(this, {
            bubbles:       true,
            cancelable:    true,
            isTrusted:     true
        }, property, {
            type:                type,
            timeStamp:           $.now(),
            eventPhase:          2,
            defaultPrevented:    false
        });
    }

    $.extend(Event.prototype, {
        preventDefault:              function () {

            this.defaultPrevented = true;

            this.originalEvent.preventDefault();
        },
        stopPropagation:             function () {

            this.bubbles = false;

            this.originalEvent.stopPropagation();
        },
        stopImmediatePropagation:    function () {

            this.stopPropagation();

            this.eventPhase = 0;
        }
    });

    return  $.Event = Event;

});