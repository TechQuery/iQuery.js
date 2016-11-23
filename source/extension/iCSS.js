define(['jquery'],  function ($) {

    var BOM = self;

/* ---------- CSS Prefix ---------- */

    var CSS_Prefix = (function (iHash) {
            for (var iKey in iHash)
                if ( $.browser[iKey] )  return iHash[iKey];
        })({
            mozilla:    'moz',
            webkit:     'webkit',
            msie:       'ms'
        });

    $.cssName = $.curry(function (Test_Type, iName) {
        return  BOM[Test_Type]  ?  iName  :  ('-' + CSS_Prefix + '-' + iName);
    });

/* ---------- CSS Rule ---------- */

    var Code_Indent = $.browser.modern ? '' : ' '.repeat(4);

    function CSS_Attribute(iName, iValue) {
        if ($.isNumeric(iValue) && iName.match($.cssPX))
            iValue += 'px';

        return  [iName, ':', Code_Indent, iValue].join('');
    }

    function CSS_Rule2Text(iRule) {
        var Rule_Text = [''],  Rule_Block,  _Rule_Block_;

        $.each(iRule,  function (iSelector) {
            Rule_Block = iSelector + ' {';
            _Rule_Block_ = [ ];

            for (var iName in this)
                _Rule_Block_.push(
                    CSS_Attribute(iName, this[iName])
                        .replace(/^(\w)/m,  Code_Indent + '$1')
                );

            Rule_Text.push(
                [Rule_Block, _Rule_Block_.join(";\n"), '}'].join("\n")
            );
        });
        Rule_Text.push('');

        return Rule_Text.join("\n");
    }

    $.cssRule = function (At_Wrapper, iRule) {
        if (typeof At_Wrapper != 'string') {
            iRule = At_Wrapper;
            At_Wrapper = null;
        }
        var CSS_Text = CSS_Rule2Text(iRule);

        var $_Style = $('<style />', {
                type:       'text/css',
                'class':    'iQuery_CSS-Rule',
                text:       (! At_Wrapper) ? CSS_Text : [
                    At_Wrapper + ' {',
                    CSS_Text.replace(/\n/m, "\n    "),
                    '}'
                ].join("\n")
            }).appendTo(DOM.head);

        return  ($_Style[0].sheet || $_Style[0].styleSheet);
    };

    function CSS_Rule_Search(iStyleSheet, iFilter) {
        return  $.map(iStyleSheet || DOM.styleSheets,  function () {
            var iRule = arguments[0].cssRules,  _Self_ = arguments.callee;
            if (! iRule)  return;

            return  $.map(iRule,  function (_Rule_) {
                return  (_Rule_.cssRules ? _Self_ : iFilter)(_Rule_);
            });
        });
    }

    function CSSRuleList() {
        $.extend(this, arguments[0]);
        this.length = arguments[0].length;
    }

    if (typeof BOM.getMatchedCSSRules != 'function')
        BOM.getMatchedCSSRules = function (iElement, iPseudo) {
            if (! (iElement instanceof Element))  return null;

            if (typeof iPseudo == 'string') {
                iPseudo = (iPseudo.match(/^\s*:{1,2}([\w\-]+)\s*$/) || [ ])[1];

                if (! iPseudo)  return null;
            } else if (iPseudo)
                iPseudo = null;

            return  new CSSRuleList(CSS_Rule_Search(null,  function (iRule) {
                var iSelector = iRule.selectorText;

                if (iPseudo) {
                    iSelector = iSelector.replace(/:{1,2}([\w\-]+)$/,  function () {
                        return  (arguments[1] == iPseudo)  ?  ''  :  arguments[0];
                    });
                    if (iSelector == iRule.selectorText)  return;
                }
                if (iElement.matches( iSelector ))  return iRule;
            }));
        };

    $.fn.cssRule = function (iRule, iCallback) {
        if (! $.isPlainObject(iRule)) {
            var $_This = this;

            return  ($_This[0]  &&  CSS_Rule_Search(null,  function (_Rule_) {
                if ((
                    (typeof $_This.selector != 'string')  ||
                    ($_This.selector != _Rule_.selectorText)
                ) &&
                    (! $_This[0].matches(_Rule_.selectorText))
                )
                    return;

                if ((! iRule)  ||  (iRule && _Rule_.style[iRule]))
                    return _Rule_;
            }));
        }
        return  this.each(function () {
            var _Rule_ = { },  _ID_ = this.getAttribute('id');

            if (! _ID_) {
                _ID_ = $.uuid();
                this.setAttribute('id', _ID_);
            }
            for (var iSelector in iRule)
                _Rule_['#' + _ID_ + iSelector] = iRule[iSelector];

            var iSheet = $.cssRule(_Rule_);

            if (typeof iCallback == 'function')  iCallback.call(this, iSheet);
        });
    };

/* ---------- Smart zIndex ---------- */

    function Get_zIndex() {
        for (
            var $_This = $(this),  zIndex;
            $_This[0];
            $_This = $($_This[0].offsetParent)
        )
            if ($_This.css('position') != 'static') {
                zIndex = parseInt( $_This.css('z-index') );

                if (zIndex > 0)  return zIndex;
            }

        return 0;
    }

    function Set_zIndex() {
        var $_This = $(this),  _Index_ = 0;

        $_This.siblings().addBack().filter(':visible').each(function () {
            _Index_ = Math.max(_Index_, Get_zIndex.call(this));
        });
        $_This.css('z-index', ++_Index_);
    }

    $.fn.zIndex = function (new_Index) {
        if (! $.isData(new_Index))
            return  Get_zIndex.call(this[0]);
        else if (new_Index == '+')
            return  this.each(Set_zIndex);
        else
            return  this.css('z-index',  parseInt(new_Index) || 'auto');
    };

});