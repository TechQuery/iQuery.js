define([
    '../../iQuery', './Observer', '../Event', '../../DOM/utility'
],  function ($, Observer) {

/* ---------- Event from Pseudo ---------- */

    $.Event.prototype.isPseudo = function () {

        var $_This = $( this.currentTarget );

        var iOffset = $_This.offset();

        return Boolean(
            (this.pageX  &&  (
                (this.pageX < iOffset.left)  ||
                (this.pageX  >  (iOffset.left + parseFloat($_This.css('width'))))
            ))  ||
            (this.pageY  &&  (
                (this.pageY < iOffset.top)  ||
                (this.pageY  >  (iOffset.top + parseFloat($_This.css('height'))))
            ))
        );
    };
/* ---------- Event extension API ---------- */

    var Event_Map = { };

    $.customEvent = function (type, factory) {

        if (typeof factory === 'function') {

            $.each(type.split(/\s+/),  function () {
                (
                    Event_Map[ this ] = Event_Map[ this ]  ||  [ ]
                ).unshift( factory );
            });
        } else if (Event_Map[ type ])
            for (var i = 0, observer;  Event_Map[ type ][i];  i++) {

                observer = Event_Map[ type ][i](factory, type);

                if ((observer != null)  &&  (observer instanceof Observer))
                    return observer;
            }
    };

/* ---------- Original supported Event ---------- */

    var Mutation_Event = $.makeSet(
            'DOMContentLoaded',
            'DOMAttrModified', 'DOMAttributeNameChanged',
            'DOMCharacterDataModified',
            'DOMElementNameChanged',
            'DOMNodeInserted', 'DOMNodeInsertedIntoDocument',
            'DOMNodeRemoved',  'DOMNodeRemovedFromDocument',
            'DOMSubtreeModified'
        );

    function originOf(type) {
        return (
            ('on' + type)  in
            Object.getPrototypeOf(this || document.documentElement)
        ) || (
            $.browser.modern  &&  (type in Mutation_Event)
        );
    }

    return $.extend({
        addEvent:       function (type, handler, cache) {

            var observer = cache.observer  ||  $.customEvent(type, this);

            if ( observer ) {

                if (typeof observer != 'string')
                    return (
                        cache.observer = observer
                    ).listen(
                        cache.proxyDispatch = $.proxy(handler, this)
                    );
                else
                    type = observer;
            }

            if (! originOf.call(this, type))  return;

            if (typeof this.addEventListener === 'function')
                this.addEventListener(type, handler);
            else {
                cache.proxyDispatch = $.proxy(handler, this);

                this.attachEvent('on' + type,  cache.proxyDispatch);
            }
        },
        removeEvent:    function (type, handler, cache) {

            if ( cache.observer ) {

                cache.observer.clear();

                delete cache.observer;    delete cache.proxyDispatch;

            } else if (originOf.call(this, type)) {

                if (typeof this.removeEventListener === 'function')
                    this.removeEventListener(type, handler);
                else {
                    this.detachEvent('on' + type,  cache.proxyDispatch);

                    delete cache.proxyDispatch;
                }
            }

            return cache;
        }
    });
});