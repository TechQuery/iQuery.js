define(['../iQuery', '../utility/ext/browser'],  function ($) {

    function Event(type, property) {

        if (type instanceof Event)
            return  $.isPlainObject( property )  ?
                $.extend(type, property)  :  type;

        if (! (this instanceof Event))  return  new Event(type, property);


        if ($.isPlainObject( type )) {

            type = type.type;    $.extend(this, type);

        } else if (typeof type.type === 'string')
            this.originalEvent = type;

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

            if ( $.browser.modern )
                this.originalEvent.preventDefault();
            else
                this.returnValue = false;
        },
        stopPropagation:             function () {

            this.bubbles = false;

            if ( $.browser.modern )
                this.originalEvent.stopPropagation();
            else
                this.cancelBubble = true;
        },
        stopImmediatePropagation:    function () {

            this.stopPropagation();

            this.eventPhase = 0;
        }
    });

    return  $.Event = Event;

});