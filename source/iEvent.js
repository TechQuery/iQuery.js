define(['iDOM'],  function ($) {

    var BOM = self,  DOM = self.document;

    var Mutation_Event = $.makeSet(
            'DOMContentLoaded',
            'DOMAttrModified', 'DOMAttributeNameChanged',
            'DOMCharacterDataModified',
            'DOMElementNameChanged',
            'DOMNodeInserted', 'DOMNodeInsertedIntoDocument',
            'DOMNodeRemoved',  'DOMNodeRemovedFromDocument',
            'DOMSubtreeModified'
        );

    function isOriginalEvent() {
        return (
            ('on' + this.type)  in
            Object.getPrototypeOf(this.target || DOM.documentElement)
        ) || (
            $.browser.modern  &&  (this.type in Mutation_Event)
        );
    }

    function W3C_Event_Object(iType, iCustom, iDetail) {
        var iEvent = DOM.createEvent(iCustom ? 'CustomEvent' : 'HTMLEvents');

        iEvent['init' + (iCustom ? 'CustomEvent' : 'Event')](
            iType,  true,  true,  iDetail
        );
        return iEvent;
    }

    var IE_Event = {
            create:    function (iEvent) {
                iEvent = (iEvent && (typeof iEvent == 'object'))  ?  iEvent  :  { };

                return  this.isCustom ?
                    $.extend({ }, iEvent, arguments[1])  :  DOM.createEventObject();
            },
            fix:       function (iEvent) {
                var iOffset = $(iEvent.srcElement).offset() || { };

                $.extend(this, {
                    type:             iEvent.type,
                    pageX:            iOffset.left,
                    pageY:            iOffset.top,
                    target:           iEvent.srcElement,
                    relatedTarget:    ({
                        mouseover:     iEvent.fromElement,
                        mouseout:      iEvent.toElement,
                        mouseenter:    iEvent.fromElement || iEvent.toElement,
                        mouseleave:    iEvent.toElement || iEvent.fromElement
                    })[iEvent.type],
                    which:
                        (iEvent.type && (iEvent.type.slice(0, 3) == 'key'))  ?
                            iEvent.keyCode  :
                            [0, 1, 3, 0, 2, 0, 0, 0][iEvent.button],
                    wheelDelta:       iEvent.wheelDelta
                });
            }
        };

    $.Event = function (iEvent, iProperty) {
        //  Instantiation without "new"
        var _Self_ = arguments.callee;

        if (iEvent instanceof _Self_)
            return  $.isPlainObject(iProperty) ?
                $.extend(iEvent, iProperty)  :  iEvent;

        if (! (this instanceof _Self_))
            return  new _Self_(iEvent, iProperty);

        //  Default Property
        $.extend(this, {
            bubbles:       true,
            cancelable:    true,
            isTrusted:     true,
            detail:        0,
            view:          BOM,
            eventPhase:    3
        });

        //  Special Property
        var iCreate = (typeof iEvent == 'string');

        if (! iCreate) {
            if ($.isPlainObject( iEvent ))
                $.extend(this, iEvent);
            else if ($.browser.modern) {
                for (var iKey in iEvent)
                    if ((typeof iEvent[iKey] != 'function')  &&  (iKey[0] > 'Z'))
                        this[iKey] = iEvent[iKey];
            } else
                IE_Event.fix.call(this, iEvent);
        }
        if ($.isPlainObject( iProperty ))  $.extend(this, iProperty);

        this.type = iCreate ? iEvent : this.type;
        this.isCustom = (! isOriginalEvent.call(this));
        this.originalEvent = (iCreate || $.isPlainObject(iEvent))  ?
            (
                $.browser.modern ?
                    W3C_Event_Object(this.type, this.isCustom, this.detail)  :
                    IE_Event.create.apply(this, arguments)
            ) : iEvent;
    };

    $.extend($.Event.prototype, {
        preventDefault:     function () {
            if ($.browser.modern)
                this.originalEvent.preventDefault();
            else
                this.originalEvent.returnValue = false;

            this.defaultPrevented = true;
        },
        stopPropagation:    function () {
            if ($.browser.modern)
                this.originalEvent.stopPropagation();
            else
                this.originalEvent.cancelBubble = true;

            this.cancelBubble = true;
        }
    });

    function Proxy_Handler(iEvent, iCallback) {
        iEvent = $.Event(iEvent);

        var $_Target = $(iEvent.target);
        var iHandler = iCallback ?
                [iCallback] :
                ($.data(this, '_event_') || { })[iEvent.type],
            iArgs = [iEvent].concat( $_Target.data('_trigger_') ),
            iThis = this;

        if (! (iHandler && iHandler.length))  return;

        for (var i = 0;  i < iHandler.length;  i++)
            if (false === (
                iHandler[i]  &&  iHandler[i].apply(iThis, iArgs)
            )) {
                iEvent.preventDefault();
                iEvent.stopPropagation();
            }

        $_Target.data('_trigger_', null);
    }

    $.event = {
        dispatch:    function (iEvent, iFilter) {
            iEvent = $.Event(iEvent);

            var iTarget = iEvent.target,  $_Path;

            switch ( $.Type(iTarget) ) {
                case 'HTMLElement':    {
                    $_Path = $(iTarget).parents().addBack();
                    $_Path = iFilter ?
                        Array.prototype.reverse.call( $_Path.filter(iFilter) )  :
                        $($.makeArray($_Path).reverse().concat(
                            iTarget.ownerDocument, iTarget.ownerDocument.defaultView
                        ));
                    break;
                }
                case 'Document':       iTarget = [iTarget, iTarget.defaultView];
                case 'Window':         {
                    if (iFilter)  return;
                    $_Path = $(iTarget);
                }
            }

            for (var i = 0;  i < $_Path.length;  i++) {
                iEvent.currentTarget = $_Path[i];

                Proxy_Handler.call($_Path[i],  iEvent,  (! i) && arguments[2]);

                if (iEvent.cancelBubble)  break;
            }
        }
    };

    $.extend(IE_Event, {
        type:       function (iType) {
            if (
                ((BOM !== BOM.top)  &&  (iType == 'DOMContentLoaded'))  ||
                ((iType == 'load')  &&  ($.Type(this) != 'Window'))
            )
                return 'onreadystatechange';

            iType = 'on' + iType;

            if (! (iType in Object.getPrototypeOf(this)))
                return 'onpropertychange';

            return iType;
        },
        handler:    function () {
            var iEvent = $.Event(BOM.event),  Loaded;
            iEvent.currentTarget = this;

            switch (iEvent.type) {
                case 'readystatechange':    iEvent.type = 'load';
                case 'load':
                    Loaded = (this.readyState == (
                        (this.tagName == 'SCRIPT')  ?  'loaded'  :  'complete'
                    ));
                    break;
                case 'propertychange':      {
                    var iType = iEvent.originalEvent.propertyName.match(/^on(.+)/i);
                    if (iType && (
                        IE_Event.type.call(this, iType[1])  ==  'onpropertychange'
                    ))
                        iEvent.type = iType[1];
                    else {
                        iEvent.type = 'DOMAttrModified';
                        iEvent.attrName = iEvent.propertyName;
                    }
                }
                default:                    Loaded = true;
            }
            if (Loaded)  arguments[0].call(this, iEvent);
        },
        bind:       function () {
            this[((arguments[0] == '+')  ?  'at'  :  'de')  +  'tachEvent'](
                IE_Event.type.call(this, arguments[1]),
                $.proxy(IE_Event.handler, this, arguments[2])
            );
        }
    });

    function Direct_Bind(iType, iCallback) {
        return  this.data('_event_',  function () {
            var Event_Data = arguments[1] || { };

            if (! Event_Data[iType]) {
                Event_Data[iType] = [ ];
                if ($.browser.modern)
                    this.addEventListener(iType, Proxy_Handler, false);
                else if (isOriginalEvent.call({
                    type:      iType,
                    target:    this
                }))
                    IE_Event.bind.call(this, '+', iType, Proxy_Handler);
            }
            Event_Data[iType].push(iCallback);

            return Event_Data;
        });
    }

    $.fn.extend({
        bind:              function (iType) {
            iType = (typeof iType == 'string')  ?
                $.makeSet.apply($, iType.trim().split(/\s+/))  :  iType;

            for (var _Type_ in iType)
                Direct_Bind.apply(this, [
                    _Type_,
                    (iType[_Type_] === true)  ?  arguments[1]  :  iType[_Type_]
                ]);

            return this;
        },
        unbind:            function (iType, iCallback) {
            iType = iType.trim().split(/\s+/);

            return  this.data('_event_',  function () {
                var Event_Data = arguments[1] || { };

                for (var i = 0, iHandler;  i < iType.length;  i++) {
                    iHandler = Event_Data[iType[i]];
                    if (! iHandler)  continue;

                    if (typeof iCallback == 'function')
                        iHandler.splice(iHandler.indexOf(iCallback), 1);
                    else
                        delete Event_Data[iType[i]];

                    if ( Event_Data[iType[i]] )  continue;

                    if ($.browser.modern)
                        this.removeEventListener(iType[i], Proxy_Handler);
                    else
                        IE_Event.bind.call(this, '-', iType[i], Proxy_Handler);
                }
                return Event_Data;
            });
        },
        on:                function (iType, iFilter, iCallback) {
            if (typeof iFilter != 'string')
                return  this.bind.apply(this, arguments);

            return  this.bind(iType,  function () {
                $.event.dispatch(arguments[0], iFilter, iCallback);
            });
        },
        one:               function () {
            var iArgs = $.makeArray(arguments),  $_This = this;
            var iCallback = iArgs[iArgs.length - 1];

            iArgs.splice(-1,  1,  function () {
                $.fn.unbind.apply($_This, (
                    (iArgs.length > 2)  ?  [iArgs[0], iArgs[2]]  :  iArgs
                ));
                return  iCallback.apply(this, arguments);
            });

            return  this.on.apply(this, iArgs);
        },
        trigger:           function () {
            this.data('_trigger_', arguments[1]);

            for (var i = 0, iEvent;  i < this.length;  i++) {
                iEvent = $.Event(arguments[0],  {target: this[i]});

                if ($.browser.modern) {
                    this[i].dispatchEvent(
                        $.extend(iEvent.originalEvent, iEvent)
                    );
                    continue;
                }
                if (! iEvent.isCustom)
                    this[i].fireEvent(
                        'on' + iEvent.type,  $.extend(iEvent.originalEvent, iEvent)
                    );
                else
                    BOM.setTimeout(function () {
                        $.event.dispatch(iEvent);
                    });
            }
            return this;
        },
        triggerHandler:    function () {

            var iHandler = $.data(this[0], '_event_'),  iReturn;

            iHandler = iHandler && iHandler[arguments[0]];
            if (! iHandler)  return;

            for (var i = 0;  i < iHandler.length;  i++)
                iReturn = iHandler[i].apply(
                    this[0],  $.merge([ ], arguments)
                );

            return iReturn;
        },
        clone:             function (iDeep) {

            return  Array.from.call($,  this,  function ($_Old) {

                var $_New = $( $_Old.cloneNode( iDeep ) );    $_Old = $( $_Old );

                if ( iDeep ) {
                    $_Old = $_Old.find('*').addBack();
                    $_New = $_New.find('*').addBack();
                }

                $_Old.each(function (i) {

                    $_New[i].dataIndex = null;

                    var iData = $.data( this );

                    if ($.isEmptyObject( iData ))  return;

                    $( $_New[i] ).data( iData );

                    for (var iType in iData._event_)
                        if ( $.browser.modern )
                            $_New[i].addEventListener(iType, Proxy_Handler, false);
                        else
                            IE_Event.bind.call($_New[i], '+', iType, Proxy_Handler);
                });

                return $_New[0];
            });
        }
    });

/* ---------- Event ShortCut ---------- */

    $.fn.off = $.fn.unbind;

    function Event_Method(iName) {
        return  function (iCallback) {
            if ((typeof iCallback == 'function')  ||  (iCallback === false))
                return  this.bind(iName, arguments[0]);

            for (var i = 0;  i < this.length;  i++)  try {
                this[i][iName]();
            } catch (iError) {
                $(this[i]).trigger(iName);
            }

            return this;
        };
    }

    for (var iName in $.makeSet(
        'abort', 'error',
        'keydown', 'keypress', 'keyup',
        'mousedown', 'mouseup', 'mousemove', 'mousewheel',
        'click', 'dblclick', 'scroll', 'resize',
        'select', 'focus', 'blur', 'change', 'submit', 'reset',
        'tap', 'press', 'swipe'
    ))
        $.fn[iName] = Event_Method(iName);


/* ---------- Complex Events ---------- */

    /* ----- DOM Ready ----- */

    var DOM_Ready = (new Promise(function (iResolve) {

            $.start('DOM_Ready');

            $( BOM ).one('DOMContentLoaded load', iResolve);

            $.every(0.5,  function () {

                if ((DOM.readyState == 'complete')  &&  (DOM.body || '').lastChild)
                    return  Boolean( iResolve( arguments[0] ) );
            });
        })).then(function () {

            $.data(DOM, 'Load_During', $.end('DOM_Ready'));

            console.info('[DOM Ready Event]');
            console.log( arguments[0] );
        });

    $.fn.ready = function () {

        if ($.Type( this[0] )  !=  'Document')
            throw 'The Ready Method is only used for Document Object !';

        DOM_Ready.then( $.proxy(arguments[0], this[0], $) );

        return this;
    };

    /* ----- Mouse Hover ----- */
    var _Float_ = {
            absolute:    true,
            fixed:       true
        };

    $.fn.hover = function (iEnter, iLeave) {
        return  this.bind('mouseover',  function () {
            if (
                $.contains(this, arguments[0].relatedTarget) ||
                ($(arguments[0].target).css('position') in _Float_)
            )
                return false;

            iEnter.apply(this, arguments);

        }).bind('mouseout',  function () {
            if (
                $.contains(this, arguments[0].relatedTarget) ||
                ($(arguments[0].target).css('position') in _Float_)
            )
                return false;

            (iLeave || iEnter).apply(this, arguments);
        });
    };

});