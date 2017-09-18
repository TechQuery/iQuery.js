define([
    './ext/base', './Event',
    '../DOM/traversing', '../polyfill/HTML-5', '../DOM/info'
],  function ($, Event) {

/* ---------- Event Core ---------- */

    var Reverse = Array.prototype.reverse;

    $.event = {
        add:         function (DOM, type, handler) {

            var event = $.data(
                    DOM,  '__event__',  $.data(DOM, '__event__') || { }
                );

            if (! event[ type ]) {

                (event[ type ] = [ ]).proxyCount = 0;

                $.addEvent.call(DOM, type, this.dispatch, event);
            }

            if ( handler.selector )
                event[ type ].splice(event[ type ].proxyCount++,  0,  handler);
            else
                event[ type ].push( handler );
        },
        remove:      function (DOM, type, handler) {

            var event = $.data(DOM, '__event__')  ||  '';

            var _event_ = event[ type ]  ||  '';

            if (! _event_[0])  return;

            event[ type ] = $.map(_event_,  function (_This_) {

                return (
                    (_This_.callback != handler.callback)  ||
                    (_This_.selector != handler.selector)  ||  (
                        handler.namespace.length !=
                        $.intersect(_This_.namespace, handler.namespace).length
                    )
                ) ? _This_ : null;
            });

            if (! event[ type ][0]) {

                delete  event[ type ];

                if ($.isEmptyObject(
                    $.removeEvent.call(DOM, type, this.dispatch, event)
                ))
                    $( DOM ).removeData('__event__');
            }

            return handler;
        },
        trigger:     function (DOM, event, namespace, data, onlyHandler) {

            event = Event(event, {
                target:       DOM,
                isTrusted:    false
            });

            var handler = $.data(DOM, '__event__')  ||  '',
                dispatch = this.dispatch;

            if (! (handler[ event.type ]  ||  '')[0])  return;

            if ( onlyHandler )
                return  dispatch.call(DOM, event, namespace, data);

            Reverse.call(
                $( DOM ).parents().add([DOM, document, self])
            ).each(function () {

                dispatch.call(this, event, namespace, data);

                if (
                    (! event.defaultPrevented)  &&
                    (typeof  this[ event.type ]  ===  'function')
                )
                    this[ event.type ]();
            });
        },
        dispatch:    function (event, namespace, data) {

            var result;    event = Event(event,  {currentTarget: this});

            $.each(
                $.event.handlers.apply(this, [
                    event,  $.data(this, '__event__')[ event.type ],  namespace
                ]),
                function () {

                    for (var i = 0;  this.handler[i];  i++) {

                        if (! this.handler[i].callback)
                            result = false;
                        else {
                            event.data = this.handler[i].data;

                            result = this.handler[i].callback.apply(
                                this.context,
                                [ event ].concat(event.isTrusted  ?  [ ]  :  data)
                            );
                            delete event.data;
                        }

                        if (! event.eventPhase)  return false;

                        if (result === false)
                            event.preventDefault(),  event.stopPropagation();
                    }

                    return event.bubbles;
                }
            );

            return result;
        },
        handlers:    function (event, handler, namespace) {

            var proxy = handler.slice(0, handler.proxyCount),  root = this;

            if (proxy[0]  &&  $.contains(this, event.target))
                proxy = $.map(
                    Reverse.call(
                        $( event.target ).parentsUntil( this ).addBack()
                    ),
                    function (_This_) {

                        return {
                            context:    _This_,
                            handler:    $.map(proxy,  function (event) {
                                if (
                                    (! _This_.matches( event.selector ))  ||  (
                                        namespace[0] &&
                                        (! $.intersect(event.namespace, namespace)[0])
                                    )
                                )  return;

                                return {
                                    data:        event.data,
                                    callback:    --event.times ?
                                        event.callback  :  function () {

                                            $.event.remove(
                                                root,  event.type,  event
                                            );

                                            return  event.callback &&
                                                event.callback.apply(
                                                    this,  arguments
                                                );
                                        }
                                };
                            })
                        };
                    }
                );

            return proxy.concat({
                context:    this,
                handler:    $.map(
                    handler.slice( handler.proxyCount ),  function () {

                        return arguments[0].callback;
                    }
                )
            });
        }
    };
/* ---------- Event API ---------- */

    $.each({
        on:     'add',
        one:    'add',
        off:    'remove'
    },  function (key, method) {

        $.fn[key] = function (event, selector, data, callback) {

            switch ( arguments.length ) {
                case 3:    {
                    callback = data,  data = null;

                    if (! $.isSelector( selector ))
                        data = selector,  selector = null;

                    break;
                }
                case 2:    callback = selector,  selector = null;
            }

            if (typeof event.valueOf() === 'string')
                event = $.makeSet(event.trim().split(/\s+/),  function () {

                    return callback;
                });

            var handler = { };

            $.each(event,  function (type) {

                type = type.split('.');

                handler[ type[0] ] = {
                    type:         type[0],
                    namespace:    type.slice(1),
                    selector:     selector,
                    data:         data,
                    callback:     callback,
                    times:        (key != 'one')  ?  Infinity  :  1
                };
            });

            return  this.each(function () {

                for (var type in handler)
                    $.event[ method ](this,  type,  handler[ type ]);
            });
        };
    });

    $.map(['trigger', 'triggerHandler'],  function (key) {

        $.fn[key] = function (event, data) {

            if (typeof event.valueOf() === 'string') {

                event = event.split('.');

                var namespace = event.slice(1);    event = event[0];
            }

            data = $.likeArray( data )  ?  data  :  [ data ];

            if (key === 'trigger')
                return  this.each(function () {

                    $.event.trigger(this, event, namespace, data);
                });
            else if ( this[0] )
                return  $.event.trigger(this[0], event, namespace, data, true);
        };
    });

    function cloneData(iNew) {

        var data = $.data( this );

        if ($.isEmptyObject( data ))  return;

        $( iNew ).data( data );

        data = data.__event__;

        for (var type in data)
            $.addEvent.call(iNew, type, $.event.dispatch, data);
    }

    $.fn.clone = function (data, deep) {

        deep = deep || data;

        return  this.map(function () {

            var iNew = this.cloneNode( true );

            if ( data )  cloneData.call(this, iNew);

            if ( deep )
                for (
                    var i = 0,  $_Old = $('*', this),  $_New = $('*', iNew);
                    $_Old[i];
                    i++
                )
                    cloneData.call($_Old[i], $_New[i]);

            return iNew;
        });
    };
});