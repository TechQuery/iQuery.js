define(['../../iQuery', './base', '../../DOM/info'],  function ($) {

/* ---------- CSS Rule (Global) ---------- */

    var Code_Indent = $.browser.modern ? '' : ' '.repeat(4);

    function CSS_Attribute(iName, iValue) {

        if ($.isNumeric( iValue )  &&  (iName in $.cssPX))
            iValue += 'px';

        return  [iName, ':', Code_Indent, iValue].join('');
    }

    function CSS_Rule2Text(iRule) {

        var Rule_Text = [''];

        $.each(iRule,  function (iSelector) {

            var Rule_Block = [ ];

            for (var iName in this)
                Rule_Block.push(
                    CSS_Attribute(iName, this[iName])
                        .replace(/^(\w)/m,  Code_Indent + '$1')
                );

            Rule_Text.push(
                [iSelector + ' {',  Rule_Block.join(";\n"),  '}'].join("\n")
            );
        });

        return  Rule_Text.concat('').join("\n");
    }

    $.cssRule = function (At_Wrapper, iRule) {

        if (typeof At_Wrapper != 'string') {

            iRule = At_Wrapper;  At_Wrapper = null;
        }

        var CSS_Text = CSS_Rule2Text( iRule );

        var $_Style = $('<style />', {
                type:       'text/css',
                'class':    'iQuery_CSS-Rule',
                text:       (! At_Wrapper) ? CSS_Text : [
                    At_Wrapper + ' {',
                    CSS_Text.replace(/\n/m,  "\n" + Code_Indent),
                    '}'
                ].join("\n")
            }).appendTo( DOM.head );

        return  ($_Style[0].sheet || $_Style[0].styleSheet);
    };

/* ---------- CSS Rule (Scoped) ---------- */

    $.fn.cssRule = function (iRule, iCallback) {

        if (! $.isPlainObject( iRule )) {

            var $_This = this;

            return  $_This[0]  &&  $.searchCSS(function (_Rule_) {
                if ((
                    (typeof $_This.selector != 'string')  ||
                    ($_This.selector != _Rule_.selectorText)
                )  &&  !(
                    $_This[0].matches( _Rule_.selectorText )
                ))
                    return;

                if ((! iRule)  ||  (iRule && _Rule_.style[iRule]))
                    return _Rule_;
            });
        }

        return  this.each(function () {

            var _Rule_ = { },  _ID_ = this.getAttribute('id');

            if (! _ID_)  this.setAttribute('id',  _ID_ = $.uuid());

            for (var iSelector in iRule)
                _Rule_['#' + _ID_ + iSelector] = iRule[ iSelector ];

            var iSheet = $.cssRule(_Rule_);

            if (typeof iCallback === 'function')  iCallback.call(this, iSheet);
        });
    };
});