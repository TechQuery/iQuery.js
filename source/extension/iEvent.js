define(['jquery'],  function ($) {

    var BOM = self,  DOM = self.document;

/* ---------- Event from Pseudo ---------- */

    $.Event.prototype.isPseudo = function () {
        var $_This = $(this.currentTarget);

        var iOffset = $_This.offset();

        return Boolean(
            (this.pageX  &&  (
                (this.pageX < iOffset.left)  ||
                (this.pageX  >  (iOffset.left + $_This.width()))
            ))  ||
            (this.pageY  &&  (
                (this.pageY < iOffset.top)  ||
                (this.pageY  >  (iOffset.top + $_This.height()))
            ))
        );
    };

/* ---------- Focus AnyWhere ---------- */

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

/* ---------- Single Finger Touch ---------- */

    var $_DOM = $(DOM);

    function get_Touch(iEvent) {
        var iTouch = iEvent;

        if ($.browser.mobile)  try {
            iTouch = iEvent.changedTouches[0];
        } catch (iError) {
            iTouch = iEvent.touches[0];
        }

        iTouch.timeStamp = iEvent.timeStamp || $.now();

        return iTouch;
    }

    $_DOM.bind(
        $.browser.mobile ? 'touchstart MSPointerDown' : 'mousedown',
        function (iEvent) {
            $(iEvent.target).data('_Gesture_Event_', get_Touch(iEvent));
        }
    ).bind(
        $.browser.mobile ? 'touchend touchcancel MSPointerUp' : 'mouseup',
        function (iEvent) {
            var $_Target = $(iEvent.target);

            var iStart = $_Target.data('_Gesture_Event_');

            if (! iStart)  return;

            $_Target.data('_Gesture_Event_', null);

            var iEnd = get_Touch(iEvent);

            iEvent = {
                target:    $_Target[0],
                detail:    iEnd.timeStamp - iStart.timeStamp,
                deltaX:    iStart.pageX - iEnd.pageX,
                deltaY:    iStart.pageY - iEnd.pageY
            };

            var iShift = Math.sqrt(
                    Math.pow(iEvent.deltaX, 2)  +  Math.pow(iEvent.deltaY, 2)
                );

            if (iEvent.detail > 300)
                iEvent.type = 'press';
            else if (iShift < 22)
                iEvent.type = 'tap';
            else {
                iEvent.type = 'swipe';
                iEvent.detail = iShift;
            }

            $_Target.trigger(iEvent);
        }
    );

/* ---------- Text Input Event ---------- */

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

/* ---------- Cross Page Event ---------- */

    function CrossPageEvent(iType, iSource) {
        if (typeof iType == 'string') {
            this.type = iType;
            this.target = iSource;
        } else
            $.extend(this, iType);

        if (! (iSource && (iSource instanceof Element)))  return;

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

        if (typeof iTarget.postMessage != 'function')  return this;

        if (arguments.length == 4) {
            $_Source = $(iData);
            iData = iCallback;
            iCallback = arguments[3];
        }

        var _Event_ = new CrossPageEvent(iType,  ($_Source || { })[0]);

        if (typeof iCallback == 'function')
            $_BOM.on('message',  function (iEvent) {
                iEvent = iEvent.originalEvent || iEvent;

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
            ($.browser.msie < 10) ? JSON.stringify(iData) : iData,  '*'
        );
    };

/* ---------- Mouse Wheel Event ---------- */

    if (! $.browser.mozilla)  return;

    $_DOM.on('DOMMouseScroll',  function (iEvent) {
        $(iEvent.target).trigger({
            type:          'mousewheel',
            wheelDelta:    -iEvent.detail * 40
        });
    });

});