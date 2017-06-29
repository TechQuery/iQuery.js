define(['../../iQuery', './Observer'],  function ($, Observer) {

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

    return $.extend({
        addEvent:       function (type, handler, cache) {

            var observer = cache.observer  ||  $.customEvent(type, this);

            if (typeof observer != 'string')
                return (
                    cache.observer = observer
                ).listen(
                    cache.proxyDispatch = $.proxy(handler, this)
                );
            else
                type = observer;

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

            } else if (typeof this.removeEventListener === 'function')
                this.removeEventListener(type, handler);
            else {
                this.detachEvent('on' + type,  cache.proxyDispatch);

                delete cache.proxyDispatch;
            }

            return cache;
        }
    });
});