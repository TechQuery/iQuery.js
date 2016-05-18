define(['jquery'],  function ($) {

    var Code_Indent = $.browser.modern ? '' : ' '.repeat(4);

    function CSS_Attribute(iName, iValue) {
        if ((! isNaN( Number(iValue) ))  &&  iName.match($.cssPX))
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

    $.cssRule = function (iMedia, iRule) {
        if (typeof iMedia != 'string') {
            iRule = iMedia;
            iMedia = null;
        }
        var CSS_Text = CSS_Rule2Text(iRule);

        var $_Style = $('<style />', {
                type:       'text/css',
                'class':    'iQuery_CSS-Rule',
                text:       (! iMedia) ? CSS_Text : [
                    '@media ' + iMedia + ' {',
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

    var DOM_Proto = Element.prototype;

    DOM_Proto.matches = DOM_Proto.matches || DOM_Proto.webkitMatchesSelector ||
        DOM_Proto.msMatchesSelector || DOM_Proto.mozMatchesSelector;

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

});