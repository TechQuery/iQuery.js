define(['iCore'],  function ($) {

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
            (this.target || DOM.documentElement).constructor.prototype
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
                ($(this).data('_event_') || { })[iEvent.type],
            iArgs = [iEvent].concat( $_Target.data('_trigger_') ),
            iThis = this,  iReturn;

        if (! (iHandler && iHandler.length))  return;

        for (var i = 0, _Return_;  i < iHandler.length;  i++)
            if (false === (
                iHandler[i]  &&  iHandler[i].apply(iThis, iArgs)
            )) {
                iEvent.preventDefault();
                iEvent.stopPropagation();
            }

        $_Target.data('_trigger_', null);

        return iReturn;
    }

    $.event = {
        dispatch:    function (iEvent, iFilter) {
            iEvent = $.Event(iEvent);

            var iTarget = iEvent.target,  $_Path;

            switch ( $.type(iTarget) ) {
                case 'HTMLElement':    {
                    $_Path = $(iTarget).parents().addBack();
                    $_Path = iFilter ?
                        Array.prototype.reverse.call( $_Path.filter(iFilter) )  :
                        $($.makeArray($_Path).reverse().concat([
                            iTarget.ownerDocument, iTarget.ownerDocument.defaultView
                        ]));
                    break;
                }
                case 'Document':       iTarget = [iTarget, iTarget.defaultView];
                case 'Window':         {
                    if (iFilter)  return;
                    $_Path = $(iTarget);
                }
            }

            for (var i = 0;  i < $_Path.length;  i++)
                if (
                    (false === Proxy_Handler.call(
                        $_Path[i],  iEvent,  (! i) && arguments[2]
                    )) ||
                    iEvent.cancelBubble
                )
                    break;
        }
    };

    $.extend(IE_Event, {
        type:       function (iType) {
            if (
                ((BOM !== BOM.top)  &&  (iType == 'DOMContentLoaded'))  ||
                ((iType == 'load')  &&  ($.type(this) != 'Window'))
            )
                return 'onreadystatechange';

            iType = 'on' + iType;

            if (! (iType in this.constructor.prototype))
                return 'onpropertychange';

            return iType;
        },
        handler:    function () {
            var iEvent = $.Event(BOM.event),  Loaded;
            iEvent.currentTarget = this;

            switch (iEvent.type) {
                case 'readystatechange':    iEvent.type = 'load';
    //                Loaded = this.readyState.match(/loaded|complete/);  break;
                case 'load':
                    Loaded = (this.readyState == 'loaded');  break;
                case 'propertychange':      {
                    var iType = iEvent.propertyName.match(/^on(.+)/i);
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
            this.attachEvent(
                IE_Event.type.call(this, arguments[0]),
                $.proxy(IE_Event.handler, this, arguments[1])
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
                    IE_Event.bind.call(this, iType, Proxy_Handler);
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

                    if (! Event_Data[iType[i]])
                        this.removeEventListener(iType[i], Proxy_Handler);
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
            var iHandler = $(this[0]).data('_event_'),  iReturn;

            iHandler = iHandler && iHandler[arguments[0]];
            if (! iHandler)  return;

            for (var i = 0;  i < iHandler.length;  i++)
                iReturn = iHandler[i].apply(
                    this[0],  $.merge([ ], arguments)
                );

            return iReturn;
        },
        clone:             function (iDeep) {
            return  $($.map(this,  function () {
                var $_Old = $(arguments[0]);
                var $_New = $( $_Old[0].cloneNode(iDeep) );

                if (iDeep) {
                    $_Old = $_Old.find('*').addBack();
                    $_New = $_New.find('*').addBack();
                }
                for (var i = 0, iData;  i < $_Old.length;  i++) {
                    $_New[i].dataIndex = null;

                    iData = $($_Old[i]).data();
                    if ($.isEmptyObject( iData ))  continue;

                    $($_New[i]).data(iData);

                    for (var iType in iData._event_) {
                        if ($.browser.modern) {
                            $_New[i].addEventListener(iType, Proxy_Handler, false);
                            continue;
                        }
                        IE_Event.bind.call($_New[i], iType, Proxy_Handler);
                    }
                }
                return $_New[0];
            }));
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

    var DOM_Focus = $.fn.focus,
        iFocusable = [
            'a[href], area',
            'label, input, textarea, button, select, option',
            '*[tabIndex], *[contentEditable]'
        ].join(', ');

    $.fn.focus = function () {
        this.not(iFocusable).attr('tabIndex', -1).css('outline', 'none');

        return  DOM_Focus.apply(this, arguments);
    };

    if ($.browser.mobile)  $.fn.click = $.fn.tap;


/* ---------- Complex Events ---------- */

    /* ----- DOM Ready ----- */
    var $_DOM = $(DOM);
    $.start('DOM_Ready');

    function DOM_Ready_Event() {
        if (DOM.isReady || (
            (this !== DOM)  &&  (
                (DOM.readyState != 'complete')  ||
                (!  (DOM.body || { }).lastChild)
            )
        ))
            return;

        DOM.isReady = true;
        BOM.clearTimeout( $_DOM.data('Ready_Timer') );
        $_DOM.data('Load_During', $.end('DOM_Ready'))
            .data('Ready_Event', arguments[0]);
        console.info('[DOM Ready Event]');
        console.log(this, arguments);

        $_DOM.trigger('ready');

        return false;
    }

    $_DOM.data('Ready_Timer',  $.every(0.5, DOM_Ready_Event));
    $_DOM.one('DOMContentLoaded', DOM_Ready_Event);
    $(BOM).one('load', DOM_Ready_Event);

    $.fn.ready = function (iCallback) {
        if ($.type(this[0]) != 'Document')
            throw 'The Ready Method is only used for Document Object !';

        if (! DOM.isReady)
            $_DOM.one('ready', iCallback);
        else
            iCallback.call(this[0],  $.data(DOM, 'Ready_Event'));

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

    /* ----- Single Finger Touch ----- */
    function get_Touch(iEvent) {
        if (! iEvent.timeStamp)
            iEvent.timeStamp = $.now();

        if (! $.browser.mobile)  return iEvent;

        try {
            return iEvent.changedTouches[0];
        } catch (iError) {
            return iEvent.touches[0];
        }
    }

    var Touch_Data;

    $_DOM.bind(
        $.browser.mobile ? 'touchstart MSPointerDown' : 'mousedown',
        function (iEvent) {
            var iTouch = get_Touch(iEvent);

            Touch_Data = {
                pX:      iTouch.pageX,
                pY:      iTouch.pageY,
                time:    iEvent.timeStamp
            };
        }
    ).bind(
        $.browser.mobile ? 'touchend touchcancel MSPointerUp' : 'mouseup',
        function (iEvent) {
            if (! Touch_Data)  return;

            var iTouch = get_Touch(iEvent);

            var swipeLeft = Touch_Data.pX - iTouch.pageX,
                swipeTop = Touch_Data.pY - iTouch.pageY,
                iDuring = iEvent.timeStamp - Touch_Data.time;

            var iShift = Math.sqrt(
                    Math.pow(swipeLeft, 2)  +  Math.pow(swipeTop, 2)
                ),
                _Event_;

            if (iDuring > 300)
                _Event_ = 'press';
            else if (iShift < 22)
                _Event_ = 'tap';
            else
                _Event_ = {
                    type:      'swipe',
                    deltaX:    swipeLeft,
                    deltaY:    swipeTop,
                    detail:    iShift
                };

            $(iEvent.target).trigger(_Event_);
        }
    );
    /* ----- Text Input Event ----- */

    function TypeBack(iHandler, iKey, iEvent) {
        var $_This = $(this);
        var iValue = $_This[iKey]();

        if (false  !==  iHandler.call(iEvent.target, iEvent, iValue))
            return;

        iValue = iValue.split('');
        iValue.splice(
            BOM.getSelection().getRangeAt(0).startOffset - 1,  1
        );
        $_This[iKey]( iValue.join('') );
    }

    $.fn.input = function (iHandler) {
        this.filter('input, textarea').on(
            $.browser.modern ? 'input' : 'propertychange',
            function (iEvent) {
                if ($.browser.modern  ||  (iEvent.propertyName == 'value'))
                    TypeBack.call(this, iHandler, 'val', iEvent);
            }
        );

        this.not('input, textarea').on('paste',  function (iEvent) {

            return  iHandler.call(
                iEvent.target,
                iEvent,
                ($.browser.modern ? iEvent : BOM).clipboardData.getData(
                    $.browser.modern ? 'text/plain' : 'text'
                )
            );
        }).keyup(function (iEvent) {

            var iKey = iEvent.which;

            if (
                (iKey < 48)  ||  (iKey > 105)  ||
                ((iKey > 90)  &&  (iKey < 96))  ||
                iEvent.ctrlKey  ||  iEvent.shiftKey  ||  iEvent.altKey
            )
                return;

            TypeBack.call(iEvent.target, iHandler, 'text', iEvent);
        });

        return this;
    };

    /* ----- Cross Page Event ----- */

    function CrossPageEvent(iType, iSource) {
        if (typeof iType == 'string') {
            this.type = iType;
            this.target = iSource;
        } else
            $.extend(this, iType);

        if (! (iSource instanceof Element))  return;

        $.extend(this,  $.map(iSource.dataset,  function (iValue) {
            if (typeof iValue == 'string')  try {
                return  $.parseJSON(iValue);
            } catch (iError) { }

            return iValue;
        }));
    }

    CrossPageEvent.prototype.valueOf = function () {
        var iValue = $.extend({ }, this);

        delete iValue.data;
        delete iValue.target;
        delete iValue.valueOf;

        return iValue;
    };

    var $_BOM = $(BOM);

    $.fn.onReply = function (iType, iData, iCallback) {
        var iTarget = this[0],  $_Source;

        if ((iTarget === BOM)  ||  ($.type(iTarget) != 'Window'))
            return this;

        if (arguments.length == 4) {
            $_Source = $(iData);
            iData = iCallback;
            iCallback = arguments[3];
        }

        var _Event_ = new CrossPageEvent(iType,  ($_Source || { })[0]);

        if (typeof iCallback == 'function')
            $_BOM.on('message',  function (iEvent) {
                var iReturn = new CrossPageEvent(
                        (typeof iEvent.data == 'string')  ?
                            $.parseJSON(iEvent.data) : iEvent.data
                    );
                if (
                    (iEvent.source === iTarget)  &&
                    (iReturn.type == iType)  &&
                    $.isEqual(iReturn, _Event_)
                ) {
                    iCallback.call($_Source ? $_Source[0] : this,  iReturn);
                    $_BOM.off('message', arguments.callee);
                }
            });
        iData = $.extend({data: iData},  _Event_.valueOf());

        iTarget.postMessage(
            ($.browser.msie < 10) ? BOM.JSON.stringify(iData) : iData,  '*'
        );
    };

    /* ----- Mouse Wheel Event ----- */

    if (! $.browser.mozilla)  return;

    $_DOM.on('DOMMouseScroll',  function (iEvent) {
        $(iEvent.target).trigger({
            type:          'mousewheel',
            wheelDelta:    -iEvent.detail * 40
        });
    });

});