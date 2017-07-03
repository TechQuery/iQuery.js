define(['../iQuery', './index'],  function ($) {

    function CSS_Rule_Sort(A, B) {

        var pA = $.selectorPriority( A.selectorText ),
            pB = $.selectorPriority( B.selectorText );

        for (var i = 0;  i < pA.length;  i++)
            if (pA[i] != pB[i])
                return  (pA[i] > pB[i])  ?  -1  :  1;

        return 0;
    }

    var Disable_Value = $.makeSet('none', '0', '0px', 'hidden');

    function Last_Valid_CSS(iName) {

        var iRule = [ this[0] ].concat(
                this.cssRule( iName ).sort( CSS_Rule_Sort ),
                {
                    style:    self.getDefaultComputedStyle(
                        this[0].tagName.toLowerCase()
                    )
                }
            );
        for (var i = 0, iValue;  iRule[i];  i++) {

            iValue = iRule[i].style[ iName ];

            if (iValue  &&  (! (iValue in Disable_Value)))
                return iValue;
        }
    }

/* ---------- Atom Effect ---------- */

    $.fn.extend({
        hide:    function () {

            return  this.css('display',  function () {

                if (arguments[1] != 'none')
                    $( this ).data('_CSS_Display_', arguments[1]);

                return 'none';
            });
        },
        show:    function () {

            return  this.each(function () {

                var $_This = $( this );

                var iStyle = $_This.css(['display', 'visibility', 'opacity']);

                if (iStyle.display === 'none')
                    $_This.css('display', (
                        $_This.data('_CSS_Display_') ||
                        Last_Valid_CSS.call($_This, 'display')
                    ));

                if (iStyle.visibility === 'hidden')
                    $_This.css('visibility', 'visible');

                if (iStyle.opacity == 0)
                    $_This.css('opacity', 1);
            });
        }
    });

/* ---------- Animation ShortCut ---------- */

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

                    if (iValue === 'auto') {

                        iValue = (CSS_Prev || { })[iKey];

                        if ((! iValue)  &&  (iValue !== 0))
                            iValue = Last_Valid_CSS.call($_This, iKey);
                    }

                    return  (iValue  ||  (iValue === 0))  ?
                        iValue  :  CSS_Next[ iKey ];
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
});