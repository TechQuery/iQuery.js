define(['Insert'],  function ($) {

/* ---------- JS-Timer Animation ---------- */

    var FPS = 60,
        Animate_Property = {
            scrollLeft:    true,
            scrollTop:     true
        };

    function KeyFrame(iStart, iEnd, During_Second) {
        During_Second = Number(During_Second) || 1;

        var iKF = [ ],  KF_Sum = FPS * During_Second;
        var iStep = (iEnd - iStart) / KF_Sum;

        for (var i = 0, KFV = iStart, j = 0;  i < KF_Sum;  i++) {
            KFV += iStep;
            iKF[j++] = Number( KFV.toFixed(2) );
        }
        return iKF;
    }

    function JSTimer_Animate(CSS_Final, During_Second, iEasing) {
        var iAnimate = [ ],  $_This = this;

        $.each(CSS_Final,  function (iName) {
            var iStyle = this;

            iAnimate.push(new Promise(function (iResolve, iReject) {
                if (! $.isNumeric(iStyle)) {
                    $_This.css(iName, iStyle);

                    return iResolve();
                }

                var iSpecial = (iName in Animate_Property);

                var iKeyFrame = KeyFrame(
                        iSpecial ? $_This[iName]() : $_This.css(iName),
                        iStyle,
                        During_Second
                    );

                $.every(1 / FPS,  function () {
                    if (! $_This.data('_Animate_'))
                        iReject('Animating stoped');
                    else if ( iKeyFrame.length ) {
                        if (iSpecial)
                            $_This[iName]( iKeyFrame.shift() );
                        else
                            $_This.css(iName, iKeyFrame.shift());

                        return;
                    } else
                        iResolve();

                    return false;
                });
            }));
        });

        return  Promise.all( iAnimate );
    }

/* ---------- CSS Animation ---------- */

    var CSS_Prefix = (function (iHash) {
            for (var iKey in iHash)
                if ( $.browser[iKey] )  return iHash[iKey];
        })({
            mozilla:    'moz',
            webkit:     'webkit',
            msie:       'ms'
        });

    function CSS_AMP() {
        return  '-' + CSS_Prefix + '-' + arguments[0];
    }

    /* ----- Transition ----- */

    var Transition_End = 'transitionend ' + CSS_Prefix + 'TransitionEnd';

    function Transition_Animate(CSS_Final) {
        var iTransition = [
                'all',  (arguments[1] + 's'),  arguments[2]
            ].join(' '),
            $_This = this;

        return  new Promise(function () {
            $_This.one(Transition_End, arguments[0])
                .css('transition', iTransition).css(
                    CSS_AMP('transition'),  iTransition
                )
                .css( CSS_Final );
        });
    }

    /* ----- KeyFrame ----- */

    var Animation_End = 'animationend ' + CSS_Prefix + 'AnimationEnd';

    function KeyFrame_Animate(iEffect) {
        var iAnimation = { },  $_This = this;

        iAnimation['animation-duration'] = iAnimation[
            CSS_AMP('animation-duration')
        ] = arguments[1] + 's';

        iAnimation['animation-timing-function'] = iAnimation[
            CSS_AMP('animation-timing-function')
        ] = arguments[2];

        return  new Promise(function (iResolve) {
            iEffect = 'animated ' + iEffect;

            $_This.one(Animation_End,  function () {

                $_This.removeClass( iEffect );

                iResolve();

            }).css( iAnimation ).addClass( iEffect );
        });
    }

/* ---------- Animation Core ---------- */

    $.fn.extend({
        animate:    function (CSS_Final) {
            if (! this[0])  return this;

            var iEngine;

            if (typeof CSS_Final == 'string')
                iEngine = KeyFrame_Animate;
            else {
                var iCSS = Object.getOwnPropertyNames( CSS_Final );

                this.data('_Animate_', 1).data('_CSS_Animate_',  function () {
                    return  $.extend(arguments[1], $(this).css(iCSS));
                });

                iEngine = (
                    (($.browser.msie < 10)  ||  (! $.isEmptyObject(
                        $.intersect($.makeSet.apply($, iCSS),  Animate_Property)
                    ))) ?
                        JSTimer_Animate  :  Transition_Animate
                );
            }

            var iArgs = $.makeArray( arguments ).slice(1);

            var During_Second = $.isNumeric( iArgs[0] )  ?
                    (iArgs.shift() / 1000)  :  0.4,
                iEasing = (typeof iArgs[0] == 'string')  ?  iArgs.shift()  :  '',
                iCallback = (typeof iArgs[0] == 'function')  &&  iArgs[0];

            return  this.data('_Animate_Queue_',  function (_, iQueue) {
                var $_This = $(this);

                var iProcess = $.proxy(
                        iEngine,  $_This,  CSS_Final,  During_Second,  iEasing
                    );

                var qCount = $_This.data('_Queue_Count_') || 0;

                $_This.data('_Queue_Count_', ++qCount);

                iQueue = (iQueue ? iQueue.then(iProcess) : iProcess())
                    .then(function () {
                        var qCount = $_This.data('_Queue_Count_');

                        if (--qCount)
                            $_This.data('_Queue_Count_', qCount);
                        else
                            $_This.data({
                                _Queue_Count_:     null,
                                _Animate_Queue_:   null
                            });
                    });

                iQueue.then(iCallback);

                return iQueue;
            });
        },
        stop:       function () {
            return  this.data('_Animate_', 0);
        },
        promise:    function () {
            return  Promise.all($.map(this,  function (iDOM) {
                return $(iDOM).data('_Animate_Queue_');
            }));
        }
    });

    $.fn.effect = $.fn.animate;

    $.fx = {interval:  1000 / FPS};

});