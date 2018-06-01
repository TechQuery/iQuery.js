define(['../../iQuery', './base'],  function ($) {

/* ---------- Single Finger Touch ---------- */

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

    var sType = $.browser.mobile ? 'touchstart MSPointerDown' : 'mousedown',
        eType = $.browser.mobile ? 'touchend touchcancel MSPointerUp' : 'mouseup';

    $.customEvent('tap press swipe',  function (DOM, type) {

        var iStart;

        return  $.Observer(function (next) {

            function sTouch() {

                iStart = get_Touch( arguments[0].originalEvent );
            }

            function eTouch(iEvent) {

                var iEnd = get_Touch( iEvent.originalEvent );

                iEvent = {
                    target:    iEvent.target,
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
                else
                    iEvent.type = 'swipe',  iEvent.detail = iShift;

                if (iEvent.type === type)  next( iEvent );
            }

            $( DOM ).on(sType, sTouch).on(eType, eTouch);

            return  function () {

                $( DOM ).off(sType, sTouch).off(eType, eTouch);
            };
        });
    });

/* ---------- Text Input Event ---------- */

    if ( $.browser.modern )  return;

    function from_Input() {

        switch ( self.event.srcElement.tagName.toLowerCase() ) {
            case 'input':       ;
            case 'textarea':    return true;
        }
    }

    $.customEvent('input',  function (DOM) {

        if ('oninput'  in  Object.getPrototypeOf( DOM ))  return;

        return  new Observer(function (next) {

            var handler = {
                    propertychange:    function () {

                        if (self.event.propertyName === 'value')
                            next( arguments[0] );
                    },
                    paste:             function () {

                        if (! from_Input())  next( arguments[0] );
                    },
                    keyup:             function (iEvent) {

                        var iKey = iEvent.keyCode;

                        if (
                            from_Input()  ||
                            (iKey < 48)  ||  (iKey > 105)  ||
                            ((iKey > 90)  &&  (iKey < 96))  ||
                            iEvent.ctrlKey  ||  iEvent.shiftKey  ||  iEvent.altKey
                        )
                            return;

                        next( iEvent );
                    }
                };

            for (var type in handler)
                DOM.attachEvent('on' + type,  handler[ type ]);

            return  function () {

                for (var type in handler)
                    DOM.detachEvent('on' + type,  handler[ type ]);
            };
        });
    });
});
