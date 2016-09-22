define(['Insert'],  function ($) {

    var BOM = self,  DOM = self.document;

    /* ----- Atom Effect ----- */

    var Pseudo_Class = $.makeSet([
            ':link', 'visited', 'hover', 'active', 'focus', 'lang',
            'enabled', 'disabled', 'checked',
            'first-child', 'last-child', 'first-of-type', 'last-of-type',
            'nth-child', 'nth-of-type', 'nth-last-child', 'nth-last-of-type',
            'only-child', 'only-of-type', 'empty'
        ].join(' :').split(' '));

    function CSS_Selector_Priority(iSelector) {
        var iPriority = [0, 0, 0];

        if ( iSelector.match(/\#[^\s>\+~]+/) )  iPriority[0]++ ;

        var iPseudo = (iSelector.match(/:[^\s>\+~]+/g)  ||  [ ]);
        var pClass = $.map(iPseudo,  function () {
                if (arguments[0] in Pseudo_Class)  return arguments[0];
            });
        iPriority[1] += (
            iSelector.match(/\.[^\s>\+~]+/g)  ||  [ ]
        ).concat(
            iSelector.match(/\[[^\]]+\]/g)  ||  [ ]
        ).concat(pClass).length;

        iPriority[2] += ((
            iSelector.match(/[^\#\.\[:]?[^\s>\+~]+/g)  ||  [ ]
        ).length + (
            iPseudo.length - pClass.length
        ));

        return iPriority;
    }

    function CSS_Rule_Sort(A, B) {
        var pA = CSS_Selector_Priority(A.selectorText),
            pB = CSS_Selector_Priority(B.selectorText);

        for (var i = 0;  i < pA.length;  i++)
            if (pA[i] == pB[i])  continue;
            else
                return  (pA[i] > pB[i])  ?  -1  :  1;
        return 0;
    }

    var Tag_Style = { },  _BOM_;

    $(DOM).ready(function () {
        _BOM_ = $('<iframe />', {
            id:     '_CSS_SandBox_',
            src:    'about:blank',
            css:    {display:  'none'}
        }).appendTo(this.body)[0].contentWindow;
    });

    function Tag_Default_CSS(iTagName) {
        if (! Tag_Style[iTagName]) {
            var $_Default = $('<' + iTagName + ' />').appendTo(
                    _BOM_.document.body
                );
            Tag_Style[iTagName] = $.extend(
                { },  BOM.getComputedStyle( $_Default[0] )
            );
            $_Default.remove();
        }
        return Tag_Style[iTagName];
    }

    var Disable_Value = $.makeSet('none', '0', '0px', 'hidden');

    function Last_Valid_CSS(iName) {
        var iRule = [this[0]].concat(
                this.cssRule( iName ).sort( CSS_Rule_Sort ),
                {
                    style:    Tag_Default_CSS( this[0].tagName.toLowerCase() )
                }
            );
        for (var i = 0, iValue;  i < iRule.length;  i++) {
            iValue = iRule[i].style[iName];

            if (iValue  &&  (! (iValue in Disable_Value)))
                return iValue;
        }
    }

    $.fn.extend({
        hide:    function () {
            return  this.css('display',  function () {
                if (arguments[1] != 'none')
                    $(this).data('_CSS_Display_', arguments[1]);
                return 'none';
            });
        },
        show:    function () {
            return  this.each(function () {
                var $_This = $(this);
                var iStyle = $_This.css(['display', 'visibility', 'opacity']);

                if (iStyle.display == 'none')
                    $_This.css('display', (
                        $_This.data('_CSS_Display_') ||
                        Last_Valid_CSS.call($_This, 'display')
                    ));
                if (iStyle.visibility == 'hidden')
                    $_This.css('visibility', 'visible');

                if (iStyle.opacity == 0)
                    $_This.css('opacity', 1);
            });
        }
    });

    /* ----- KeyFrame Animation ----- */

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

    function KeyFrame_Animate(CSS_Final, During_Second, iEasing) {
        var iAnimate = [ ],  $_This = $(this);

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

    /* ----- Transition Animation ----- */

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

    var End_Event = 'TransitionEnd';
    var Bind_Name = End_Event.toLowerCase() + ' ' + CSS_Prefix + End_Event;

    function Transition_Animate(CSS_Final) {
        var iTransition = [
                'all',  (arguments[1] + 's'),  arguments[2]
            ].join(' '),
            $_This = $(this);

        return  new Promise(function () {
            $_This.on(Bind_Name, arguments[0])
                .css('transition', iTransition).css(
                    CSS_AMP('transition'),  iTransition
                )
                .css( CSS_Final );
        });
    }

    $.fn.extend({
        animate:    function (CSS_Final) {
            if (! this[0])  return this;

            var iCSS = Object.getOwnPropertyNames( CSS_Final );

            this.data('_Animate_', 1).data('_CSS_Animate_',  function () {
                return  $.extend(arguments[1], $(this).css(iCSS));
            });

            var iEngine = (
                    (($.browser.msie < 10)  ||  (! $.isEmptyObject(
                        $.intersect($.makeSet.apply($, iCSS),  Animate_Property)
                    ))) ?
                        KeyFrame_Animate  :  Transition_Animate
                );

            var iArgs = $.makeArray( arguments ).slice(1);

            var During_Second = $.isNumeric( iArgs[0] )  ?
                    (iArgs.shift() / 1000)  :  0.4,
                iEasing = (typeof iArgs[0] == 'string')  ?  iArgs.shift()  :  '',
                iCallback = (typeof iArgs[0] == 'function')  &&  iArgs[0];

            return  this.data('_Animate_Queue_',  function (_, iQueue) {
                var iProcess = $.proxy(
                        iEngine,  this,  CSS_Final,  During_Second,  iEasing
                    );

                iQueue = iQueue ? iQueue.then(iProcess) : iProcess();

                iQueue.then(iCallback);

                return iQueue;
            });
        },
        stop:       function () {
            return  this.data('_Animate_', 0);
        },
        promise:    function () {
            return this.data('_Animate_Queue_');
        }
    });

    /* ----- Animation ShortCut ----- */

    $.fn.extend($.map({
        fadeIn:     {opacity:  1},
        fadeOut:    {opacity:  0},
        slideUp:    {
            overflow:            'hidden',
            height:              0,
            'padding-left':      0,
            'padding-right':     0,
            'padding-top':       0,
            'padding-bottom':    0,
            opacity:             0
        },
        slideDown:    {
            overflow:            'auto',
            height:              'auto',
            'padding-left':      'auto',
            'padding-right':     'auto',
            'padding-top':       'auto',
            'padding-bottom':    'auto',
            opacity:             1
        }
    },  function (CSS_Next) {
        return  function () {
            if (! this[0])  return this;

            var $_This = this,  CSS_Prev = this.data('_CSS_Animate_');

            return  this.animate.apply(this, $.merge(
                [$.map(CSS_Next,  function (iValue, iKey) {
                    if (iValue == 'auto') {
                        iValue = (CSS_Prev || { })[iKey];
                        if ((! iValue)  &&  (iValue !== 0))
                            iValue = Last_Valid_CSS.call($_This, iKey);
                    }
                    return  (iValue  ||  (iValue === 0))  ?
                        iValue : CSS_Next[iKey];
                })],
                arguments
            ));
        };
    }));

    $.fn.toggle = function () {
        return  this[[
            ['show', 'hide'],  ['slideDown', 'slideUp']
        ][
            arguments.length && 1
        ][
            this.height() && 1
        ]].apply(
            this,  arguments
        );
    };

    $.fx = {interval:  1000 / FPS};

});