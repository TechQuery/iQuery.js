define(['../../object/ext/advanced', '../../event/wrapper'],  function ($) {

    var BOM = self;

/* ---------- CSS Selector Priority ---------- */

    var Pseudo_Class = $.makeSet([
            ':link', 'visited', 'hover', 'active', 'focus', 'lang',
            'enabled', 'disabled', 'checked',
            'first-child', 'last-child', 'first-of-type', 'last-of-type',
            'nth-child', 'nth-of-type', 'nth-last-child', 'nth-last-of-type',
            'only-child', 'only-of-type', 'empty'
        ].join(' :').split(' '));

    $.selectorPriority = function (iSelector) {

        var iPriority = [0, 0, 0];

        if (iSelector.match( /\#[^\s>\+~]+/ ))  iPriority[0]++ ;

        var iPseudo = iSelector.match( /:[^\s>\+~]+/g )  ||  [ ];

        var pClass = $.map(iPseudo,  function () {

                if (arguments[0] in Pseudo_Class)  return arguments[0];
            });

        iPriority[1] += (
            iSelector.match( /\.[^\s>\+~]+/g )  ||  [ ]
        ).concat(
            iSelector.match( /\[[^\]]+\]/g )  ||  [ ]
        ).concat( pClass ).length;

        iPriority[2] += ((
            iSelector.match( /[^\#\.\[:]?[^\s>\+~]+/g )  ||  [ ]
        ).length + (
            iPseudo.length - pClass.length
        ));

        return iPriority;
    };

/* ---------- CSS Prefix ---------- */

    var CSS_Prefix = (function (iHash) {

            for (var iKey in iHash)
                if ($.browser[ iKey ])  return iHash[iKey];
        })({
            mozilla:    'moz',
            webkit:     'webkit',
            msie:       'ms'
        });

    $.cssName = $.curry(function (Test_Type, iName) {

        return  BOM[ Test_Type ]  ?  iName  :  ('-' + CSS_Prefix + '-' + iName);
    });

/* ---------- CSS Rule (Default) ---------- */

    function CSS_Rule_Sort(A, B) {

        var pA = $.selectorPriority( A.selectorText ),
            pB = $.selectorPriority( B.selectorText );

        for (var i = 0;  i < pA.length;  i++)
            if (pA[i] != pB[i])
                return  (pA[i] > pB[i])  ?  -1  :  1;

        return 0;
    }

    var Tag_Style = { },  _BOM_;

    $( document ).ready(function () {

        _BOM_ = $('<iframe />', {
            id:     '_CSS_SandBox_',
            src:    'about:blank',
            css:    {display:  'none'}
        }).appendTo( this.body )[0].contentWindow;
    });

    if (typeof BOM.getDefaultComputedStyle != 'function')
        BOM.getDefaultComputedStyle = function (iTagName, pseudo) {

            if (! Tag_Style[ iTagName ]) {

                var $_Default = $('<' + iTagName + ' />').appendTo(
                        _BOM_.document.body
                    );
                Tag_Style[ iTagName ] = $.extend(
                    { },  self.getComputedStyle($_Default[0], pseudo)
                );
                $_Default.remove();
            }

            return  Tag_Style[ iTagName ];
        };

/* ---------- CSS Rule (Matched) ---------- */

    $.searchCSS = function (iStyleSheet, iFilter) {

        if (iStyleSheet instanceof Function)
            iFilter = iStyleSheet,  iStyleSheet = '';

        return  $.map(iStyleSheet || document.styleSheets,  function _Self_() {

            var iRule = arguments[0].cssRules;

            if (! iRule)  return;

            return  $.map(iRule,  function (_Rule_) {

                return  (_Rule_.cssRules ? _Self_ : iFilter)(_Rule_);
            });
        });
    };

    function CSSRuleList() {

        this.length = 0;

        $.merge(this, arguments[0]);
    }

    if (typeof BOM.getMatchedCSSRules != 'function')
        BOM.getMatchedCSSRules = function (iElement, iPseudo) {

            if (! (iElement instanceof Element))  return null;

            if (typeof iPseudo === 'string') {

                iPseudo = (iPseudo.match(/^\s*:{1,2}([\w\-]+)\s*$/) || [ ])[1];

                if (! iPseudo)  return null;

            } else if ( iPseudo )  iPseudo = null;

            return  new CSSRuleList($.searchCSS(function (iRule) {

                var iSelector = iRule.selectorText;

                if ( iPseudo ) {
                    iSelector = iSelector.replace(/:{1,2}([\w\-]+)$/,  function () {

                        return  (arguments[1] === iPseudo)  ?  ''  :  arguments[0];
                    });

                    if (iSelector === iRule.selectorText)  return;
                }

                if (iElement.matches( iSelector ))  return iRule;
            }));
        };
});