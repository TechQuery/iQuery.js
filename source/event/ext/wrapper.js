define(['../../iQuery', '../wrapper'],  function ($) {

/* ---------- Focus AnyWhere ---------- */

    var DOM_Focus = $.fn.focus;

    $.fn.focus = function () {

        this.not(':focusable').attr('tabIndex', -1).css('outline', 'none');

        return  DOM_Focus.apply(this, arguments);
    };

/* ---------- User Idle Event ---------- */

    var End_Event = 'keydown mousedown scroll';

    $.fn.onIdleFor = function (iSecond, iCallback) {

        return  this.each(function _Self_() {

            var iNO,  $_This = $( this );

            function iCancel() {

                clearTimeout( iNO );

                _Self_.call( $_This.off(End_Event, iCancel)[0] );
            }

            iNO = $.wait(iSecond,  function () {

                iCallback.call(
                    $_This.off(End_Event, iCancel)[0],
                    $.Event({
                        type:      'idle',
                        target:    $_This[0]
                    })
                );

                _Self_.call( $_This[0] );
            });

            $_This.one(End_Event, iCancel);
        });
    };

/* ---------- Cross Page Event ---------- */

    function CrossPageEvent(iType, iSource) {

        if (typeof iType === 'string') {

            this.type = iType;  this.target = iSource;
        } else
            $.extend(this, iType);

        if (! (iSource && (iSource instanceof Element)))  return;

        $.extend(this,  $.map(iSource.dataset,  function (iValue) {

            if (typeof iValue === 'string')  try {

                return  $.parseJSON( iValue );

            } catch (iError) { }

            return iValue;
        }));
    }

    CrossPageEvent.prototype.valueOf = function () {

        var iValue = $.extend({ }, this);

        delete iValue.data;  delete iValue.target;  delete iValue.valueOf;

        return iValue;
    };

    var $_BOM = $( self );

    $.fn.onReply = function (iType, iData, iCallback) {

        var iTarget = this[0],  $_Source;

        if (typeof iTarget.postMessage != 'function')  return this;

        if (arguments.length === 4) {

            $_Source = $( iData );  iData = iCallback;  iCallback = arguments[3];
        }

        var _Event_ = new CrossPageEvent(iType,  ($_Source || { })[0]);

        if (typeof iCallback === 'function')
            $_BOM.on('message',  function onMessage(iEvent) {

                iEvent = iEvent.originalEvent || iEvent;

                var iReturn = new CrossPageEvent(
                        (typeof iEvent.data === 'string')  ?
                            $.parseJSON( iEvent.data )  :  iEvent.data
                    );
                if (
                    (iEvent.source === iTarget)  &&
                    (iReturn.type === iType)  &&
                    $.isEqual(iReturn, _Event_)
                ) {
                    iCallback.call($_Source ? $_Source[0] : this,  iReturn);

                    $_BOM.off('message', onMessage);
                }
            });

        iData = $.extend({data: iData},  _Event_.valueOf());

        iTarget.postMessage(
            ($.browser.msie < 10)  ?  JSON.stringify( iData )  :  iData,  '*'
        );
    };
});
