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

    /**
     * 全局 CSS 设置
     *
     * @author TechQuery
     *
     * @memberof $
     *
     * @param   {string}           At_Wrapper - At Rule
     * @param   {object}           rule       - Selector as Key, Rule as Value
     *
     * @returns {HTMLStyleElement} Generated Style Element
     */

    $.cssRule = function (At_Wrapper, rule) {

        if (typeof At_Wrapper.valueOf() != 'string')
            rule = At_Wrapper,  At_Wrapper = null;

        var CSS_Text = CSS_Rule2Text( rule );

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
                _This_  :  ('#'  +  _ID_  +  ' '  +  _This_);

        }).join(',  ');
    }

    var Global_Style = $.makeSet('#document', 'html', 'body');

    /**
     * 局部 CSS 读写
     *
     * @memberof $.prototype
     * @function cssRule
     *
     * @param    {object}   [rule]     - Selector as Key, Rule as Value
     * @param    {function} [callback] - Callback for every {@link HTMLElement}
     *
     * @return   {object|$} No parameter: CSS Rule Object\n
     *                      One or two:   iQuery Object
     */

    $.fn.cssRule = function (rule, callback) {

        if (! $.isPlainObject( rule )) {

            var $_This = this;

            return  $_This[0]  &&  $.searchCSS(function (_Rule_) {
                if ((
                    (typeof $_This.selector != 'string')  ||
                    ($_This.selector != _Rule_.selectorText)
                )  &&  !(
                    $_This[0].matches( _Rule_.selectorText )
                ))
                    return;

                if ((! rule)  ||  (rule && _Rule_.style[rule]))
                    return _Rule_;
            });
        }

        this.not([self, document.head]).uniqueId().each(function () {

            var _Rule_ = { };

            for (var iSelector in rule)
                _Rule_[Scope_Selector(this.id, iSelector)] = rule[ iSelector ];

            var $_Insert = $(
                    'style, link[rel="stylesheet"]',
                    (this.nodeName.toLowerCase() in Global_Style)  ?
                        document.head  :  this
                ),
                end = 'After';

            if ( $_Insert[0] )
                $_Insert = $_Insert.slice( -1 );
            else
                $_Insert = $( this ),  end = 'Before';

            _Rule_ = $( $.cssRule(_Rule_) )['insert' + end]( $_Insert )[0];

            if (typeof callback === 'function')
                callback.call(this,  _Rule_.sheet || _Rule_.styleSheet);
        });

        return this;
    };

});