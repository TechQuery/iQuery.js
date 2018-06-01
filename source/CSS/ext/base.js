define([
    '../../iQuery', '../../object/ext/advanced', '../../event/wrapper'
],  function ($) {

    var BOM = self;

/* ---------- CSS Selector Priority ---------- */

    var Pseudo_Class = $.makeSet([
            ':link', 'visited', 'hover', 'active', 'focus', 'lang',
            'enabled', 'disabled', 'checked',
            'first-child', 'last-child', 'first-of-type', 'last-of-type',
            'nth-child', 'nth-of-type', 'nth-last-child', 'nth-last-of-type',
            'only-child', 'only-of-type', 'empty'
        ].join(' :').split(' '));

    $.selectorPriority = function (selector) {

        var priority = [0, 0, 0];

        if (selector.match( /\#[^\s>\+~]+/ ))  priority[0]++ ;

        var pseudo = selector.match( /:[^\s>\+~]+/g )  ||  [ ];

        var pClass = $.map(pseudo,  function () {

                if (arguments[0] in Pseudo_Class)  return arguments[0];
            });

        priority[1] += (
            selector.match( /\.[^\s>\+~]+/g )  ||  [ ]
        ).concat(
            selector.match( /\[[^\]]+\]/g )  ||  [ ]
        ).concat( pClass ).length;

        priority[2] += ((
            selector.match( /[^\#\.\[:]?[^\s>\+~]+/g )  ||  [ ]
        ).length + (
            pseudo.length - pClass.length
        ));

        return priority;
    };

/* ---------- CSS Prefix ---------- */

    var CSS_Prefix = (function (hash) {

            for (var key in hash)
                if ($.browser[ key ])  return hash[key];
        })({
            mozilla:    'moz',
            webkit:     'webkit',
            msie:       'ms'
        });

    $.cssName = $.curry(function (Test_Type, name) {

        return  BOM[ Test_Type ]  ?  name  :  ('-' + CSS_Prefix + '-' + name);
    });

/* ---------- CSS Rule (Default) ---------- */

    var Tag_Style = { },  _DOM_ = document.implementation.createHTMLDocument('');

    if (typeof BOM.getDefaultComputedStyle != 'function')
        BOM.getDefaultComputedStyle = function (tagName, pseudo) {

            if (! Tag_Style[ tagName ]) {

                var Default = _DOM_.body.appendChild(
                        _DOM_.createElement( tagName )
                    );

                Tag_Style[ tagName ] = $.extend(
                    { },  self.getComputedStyle(Default, pseudo)
                );

                Default.remove();
            }

            return  Tag_Style[ tagName ];
        };

/* ---------- CSS Rule (Matched) ---------- */

    $.searchCSS = function (styleSheet, filter) {

        if (styleSheet instanceof Function)
            filter = styleSheet,  styleSheet = '';

        return  $.map(styleSheet || document.styleSheets,  function _Self_() {

            var rule = arguments[0].cssRules;

            if (! rule)  return;

            return  $.map(rule,  function (_Rule_) {

                return  (_Rule_.cssRules ? _Self_ : filter)(_Rule_);
            });
        });
    };

    function CSSRuleList() {

        this.length = 0;

        $.merge(this, arguments[0]);
    }

    if (typeof BOM.getMatchedCSSRules != 'function')
        BOM.getMatchedCSSRules = function (element, pseudo) {

            if (! (element instanceof Element))  return null;

            if (typeof pseudo === 'string') {

                pseudo = (pseudo.match(/^\s*:{1,2}([\w\-]+)\s*$/) || [ ])[1];

                if (! pseudo)  return null;

            } else if ( pseudo )  pseudo = null;

            return  new CSSRuleList($.searchCSS(function (rule) {

                var selector = rule.selectorText;

                if ( pseudo ) {
                    selector = selector.replace(/:{1,2}([\w\-]+)$/,  function () {

                        return  (arguments[1] === pseudo)  ?  ''  :  arguments[0];
                    });

                    if (selector === rule.selectorText)  return;
                }

                if (element.matches( selector ))  return rule;
            }));
        };
});
