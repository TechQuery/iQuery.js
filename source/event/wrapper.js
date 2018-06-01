define(['../iQuery', './index', '../polyfill/ES/Promise_A+'],  function ($) {

/* ---------- Event ShortCut ---------- */

    $.map([
        'abort', 'error',
        'keydown', 'keypress', 'keyup',
        'mousedown', 'mouseup', 'mousemove',
        'mouseover', 'mouseout', 'mouseenter', 'mouseleave',
        'click', 'dblclick', 'scroll', 'resize', 'contextmenu',
        'select', 'focus', 'blur', 'change', 'submit', 'reset',
        'tap', 'press', 'swipe'
    ],  function (name) {

        $.fn[name] = function (callback) {

            if ((typeof callback === 'function')  ||  (callback === false))
                return  this.on(name, callback);

            for (var i = 0;  this[i];  i++)  try {

                this[i][ name ]();

            } catch (iError) {

                $( this[i] ).trigger( name );
            }

            return this;
        };
    });

/* ---------- Complex Events ---------- */

    /* ----- DOM Ready ----- */

    $.ready = new Promise(function (iResolve) {

        $.start('DOM_Ready');

        if ( $.browser.modern )
            $( document ).one('DOMContentLoaded', iResolve)
        else if (self === self.top)
            $.every(0.01,  function () {
                try {
                    document.documentElement.doScroll('left');

                    return  Boolean( iResolve( arguments[0] ) );

                } catch (iError) {  return;  }
            });

        $( self ).one('load', iResolve);

        $.every(0.5,  function () {
            if (
                (document.readyState === 'complete')  &&
                (document.body || '').lastChild
            )
                return  Boolean( iResolve( arguments[0] ) );
        });
    });

    $.ready.then(function () {

        $( document ).data('Load_During', $.end('DOM_Ready')).trigger('ready');

        console.info('[DOM Ready Event]');
        console.log( arguments[0] );
    });

    $.fn.ready = function () {

        if ($.Type( this[0] )  !=  'Document')
            throw 'The Ready Method is only used for Document Object !';

        $.ready.then( $.proxy(arguments[0], this[0], $) );

        return this;
    };

    /* ----- Mouse Hover ----- */

    $.fn.hover = function (iEnter, iLeave) {

        return  this.mouseenter( iEnter ).mouseleave(iLeave || iEnter);
    };

/* ---------- Event Shim ---------- */

    //  Focus / Blur  bubble

    $.customEvent('focus blur',  function (DOM, type) {

        return  ($.browser.mozilla < 52)  ?
            $.Observer(function (next) {

                DOM.addEventListener(type, next, true);

                return  function () {

                    DOM.removeEventListener(type, next, true);
                };
            })  :
            ((type === 'blur')  ?  'focusout'  :  'focusin')
    });

    if ( $.browser.modern )  return;

    //  Change of checked

    $( document ).on(
        'click',  'input[type="radio"], input[type="checkbox"]',  function () {

            this.blur();    this.focus();
        }
    );

    //  Load of resource

    $.customEvent('load',  function (DOM) {

        return  (DOM instanceof Element)  &&  $.Observer(function (next) {

            function onLoad() {

                if (DOM.readyState === (
                    (DOM.tagName.toLowerCase() === 'script')  ?
                        'loaded'  :  'complete'
                ))
                    next( arguments[0] );
            }

            DOM.attachEvent('onreadystatechange', onLoad);

            return  function () {

                DOM.detachEvent('onreadystatechange', onLoad);
            };
        });
    });

    //  Submit / Reset  bubble

    $.customEvent('submit reset',  function (DOM, type) {

        if (DOM.tagName.toLowerCase() === 'form')  return;

        return  $.Observer(function (next) {

            function pressEnter(event) {

                if (event.keyCode === 13)  next( event );
            }

            $( DOM )
                .on('keydown', 'input button', pressEnter)
                .on('click',  'form [type="' + type + '"]',  next);

            return  function () {

                $( DOM ).off('keydown', pressEnter).off('click', next);
            };
        });
    });
});
