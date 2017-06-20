define([
    '../iQuery', '../DOM/traversing', '../polyfill/HTML-5', '../DOM/info'
],  function ($) {

/* ---------- Event Toolkit ---------- */

    var Reverse = Array.prototype.reverse;

    $.event = {
        add:         function (DOM, type, handler) {

            var event = $.data(
                    DOM,  '__event__',  $.data(DOM, '__event__') || { }
                );

            if (! event[ type ]) {

                (event[ type ] = [ ]).proxyCount = 0;

                DOM.addEventListener(type, this.dispatch);
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

                DOM.removeEventListener(type, this.dispatch);
            }

            return handler;
        },
        trigger:     function (DOM, type, handler) {

            var event = $.data(DOM, '__event__')  ||  '';

            var _event_ = event[ type ]  ||  '',  dispatch = this.dispatch;

            if (! _event_[0])  return;

            event = $.Event( type );

            Reverse.call(
                $( DOM ).parents().add([DOM, document, self])
            ).each(function () {

                dispatch.call(this, event);

                if (
                    (! event.defaultPrevented)  &&
                    (typeof  this[ type ]  ===  'function')
                )
                    this[ type ]();
            });
        },
        dispatch:    function (event) {

            var queue = $.event.handlers.call(
                    this,  event,  $.data( this ).__event__
                );

            for (var i = 0;  queue[i];  i++)
                if (false  ===  (queue[i].handler && queue[i].handler.apply(
                    queue[i].context,  [ event ]
                )))
                    event.preventDefault(),  event.stopPropagation();
        },
        handlers:    function (event, handler) {

            var proxy = handler.slice(0, handler.proxyCount),  root = this;

            if ( proxy[0] )
                proxy = $.map(
                    Reverse.call(
                        $( target ).parentsUntil( this ).add( target )
                    ),
                    function (_This_) {

                        return {
                            context:    _This_,
                            handler:    $.map(proxy,  function (event) {

                                if (! _This_.matches( event.selector ))  return;

                                return  --event.times ?
                                    event.callback  :  function () {

                                        $.event.remove(root, event.type, event);

                                        return  event.callback &&
                                            event.callback.apply(this, arguments);
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
        on:         'add',
        one:        'add',
        off:        'remove',
        trigger:    'trigger'
    },  function (key, method) {

        $.fn[key] = function (event, selector, data, callback) {

            if (typeof event.valueOf() === 'string')
                event = $.makeSet(event.trim().split(/\s+/),  function () {

                    return callback;
                });

            if (method != 'trigger')
                switch ( arguments.length ) {
                    case 3:    {
                        callback = data,  data = null;

                        if (! $.isSelector( selector ))
                            data = selector,  selector = null;

                        break;
                    }
                    case 2:    callback = selector,  selector = null;
                }
            else
                data = $.likeArray( selector )  ?  selector  :  [ selector ],
                selector = null;

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
});