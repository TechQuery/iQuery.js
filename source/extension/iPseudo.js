define(['jquery'],  function ($) {

/* ---------- Enhance jQuery Pseudo ---------- */

    /* ----- :image ----- */

    var pImage = $.extend($.makeSet('IMG', 'SVG', 'CANVAS'), {
            INPUT:    {type:  'image'},
            LINK:     {type:  'image/x-icon'}
        });

    $.expr[':'].image = function (iDOM) {
        if (iDOM.tagName in pImage)
            return  (pImage[iDOM.tagName] === true)  ||
                (pImage[iDOM.tagName].type == iDOM.type.toLowerCase());

        return  ($(iDOM).css('background-image') != 'none');
    };

    /* ----- :button ----- */

    var pButton = $.makeSet('button', 'image', 'submit', 'reset');

    $.expr[':'].button = function (iDOM) {
        return  (iDOM.tagName == 'BUTTON')  ||  (
            (iDOM.tagName == 'INPUT')  &&  (iDOM.type.toLowerCase() in pButton)
        );
    };

    /* ----- :input ----- */

    var pInput = $.makeSet('INPUT', 'TEXTAREA', 'BUTTON', 'SELECT');

    $.expr[':'].input = function (iDOM) {
        return  (iDOM.tagName in pInput)  ||
            (typeof iDOM.getAttribute('contentEditable') == 'string')  ||
            iDOM.designMode;
    };

/* ---------- iQuery Extended Pseudo ---------- */

    /* ----- :list, :data ----- */

    var pList = $.makeSet('UL', 'OL', 'DL', 'TBODY', 'SELECT', 'DATALIST');

    $.extend($.expr[':'], {
        list:    function () {
            return  (arguments[0].tagName in pList);
        },
        data:    function (iDOM, Index, iMatch) {
            return  Boolean($.data(iDOM, iMatch[3]));
        }
    });

    /* ----- :focusable ----- */

    var pFocusable = [
            'a[href],  map[name] area[href]',
            'label, input, textarea, button, select, option, object',
            '*[tabIndex], *[contentEditable]'
        ].join(', ');

    $.expr[':'].focusable = function () {
        return arguments[0].matches(pFocusable);
    };

    /* ----- :scrollable ----- */

    var Rolling_Style = $.makeSet('auto', 'scroll');

    $.expr[':'].scrollable = function () {
        var $_This = $( arguments[0] );

        var iCSS = $_This.css([
                'width',       'height',
                'max-width',   'max-height',
                'overflow-x',  'overflow-y'
            ]);

        return (
            (
                (parseFloat(iCSS.width) || parseFloat(iCSS['max-width']))  &&
                (iCSS['overflow-x'] in Rolling_Style)
            )  ||
            (
                (parseFloat(iCSS.height) || parseFloat(iCSS['max-height']))  &&
                (iCSS['overflow-y'] in Rolling_Style)
            )
        );
    };

    /* ----- :media ----- */

    var pMedia = $.makeSet('IFRAME', 'OBJECT', 'EMBED', 'AUDIO', 'VIDEO');

    $.expr[':'].media = function (iDOM) {
        if (iDOM.tagName in pMedia)  return true;

        if (! $.expr[':'].image(iDOM))  return;

        var iSize = $.map($(iDOM).css([
                'width', 'height', 'min-width', 'min-height'
            ]), parseFloat);

        return (
            (Math.max(iSize.width, iSize['min-width']) > 240)  ||
            (Math.max(iSize.height, iSize['min-height']) > 160)
        );
    };

});
