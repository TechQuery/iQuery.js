define(['jquery'],  function ($) {

/* ---------- Enhanced :image ---------- */

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

/* ---------- Enhanced :button ---------- */

    var pButton = $.makeSet('button', 'image', 'submit', 'reset');

    $.expr[':'].button = function (iDOM) {
        return  (iDOM.tagName == 'BUTTON')  ||  (
            (iDOM.tagName == 'INPUT')  &&  (iDOM.type.toLowerCase() in pButton)
        );
    };

/* ---------- Enhanced :input ---------- */

    var pInput = $.makeSet('INPUT', 'TEXTAREA', 'BUTTON', 'SELECT');

    $.expr[':'].input = function (iDOM) {
        return  (iDOM.tagName in pInput)  ||
            (typeof iDOM.getAttribute('contentEditable') == 'string')  ||
            iDOM.designMode;
    };

/* ---------- iQuery Extended Pseudo ---------- */

    var pList = $.makeSet('UL', 'OL', 'DL', 'TBODY', 'SELECT', 'DATALIST');

    $.extend($.expr[':'], {
        list:    function () {
            return  (arguments[0].tagName in pList);
        },
        data:    function () {
            return  (! $.isEmptyObject(arguments[0].dataset));
        }
    });

    var pFocusable = [
            'a[href],  map[name] area[href]',
            'label, input, textarea, button, select, option, object',
            '*[tabIndex], *[contentEditable]'
        ].join(', ');

    $.expr[':'].focusable = function () {
        return arguments[0].matches(pFocusable);
    };

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