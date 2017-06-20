define(['../../iQuery', './base', '../../DOM/info'],  function ($) {

/* ----------  JSON to <style />  ---------- */

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

        if (typeof At_Wrapper.valueOf() != 'string')
            iRule = At_Wrapper,  At_Wrapper = null;

        var CSS_Text = CSS_Rule2Text( iRule );

        return  $('<style />', {
            type:       'text/css',
            'class':    'iQuery_CSS-Rule',
            text:       (! At_Wrapper)  ?  CSS_Text  :  [
                At_Wrapper + ' {',
                CSS_Text.replace(/\n/m,  "\n" + Code_Indent),
                '}'
            ].join("\n")
        })[0];
    };

/* ---------- CSS Rule (Scoped) ---------- */

    function Scope_Selector(_ID_) {

        return  $.map(arguments[1].split( /\s*,\s*/ ),  function (_This_) {

            return  /[\s>\+~]?#/.test(_This_)  ?
                _This_ :
                '#' + _ID_ +  (/^\w/.test(_This_) ? ' ' : '')  +  _This_;

        }).join(',  ');
    }

    var Global_Style = $.makeSet('#document', 'html', 'body');


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

        this.not([self, document.head]).uniqueId().each(function () {

            var _Rule_ = { };

            for (var iSelector in iRule)
                _Rule_[Scope_Selector( this.id )] = iRule[ iSelector ];

            _Rule_ = $(
                'style, link[rel="stylesheet"]',
                (this.nodeName.toLowerCase() in Global_Style)  ?
                    document.head  :  this
            ).after( $.cssRule(_Rule_) );

            if (typeof iCallback === 'function')
                iCallback.call(this,  _Rule_.sheet || _Rule_.styleSheet);
        });

        return this;
    };

});