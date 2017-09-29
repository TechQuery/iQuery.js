define([
    '../../iQuery', '../../DOM/info', '../../polyfill/HTML-5',
    '../../DOM/traversing'
],  function ($) {

/* ---------- Enhance jQuery Pseudo ---------- */

    /* ----- :image ----- */

    var pImage = $.extend($.makeSet('img', 'svg', 'canvas'), {
            input:    {type:  'image'},
            link:     {type:  'image/x-icon'}
        });

    $.expr[':'].image = function (iDOM) {

        var iName = iDOM.tagName.toLowerCase();

        return  (iName in pImage)  ?
            (
                (pImage[ iName ]  ===  true)  ||
                (pImage[ iName ].type  ===  iDOM.type.toLowerCase())
            )  :  !(
                $( iDOM ).css('background-image').indexOf('url(')
            );
    };

    /* ----- :button ----- */

    var pButton = $.makeSet('button', 'image', 'submit', 'reset');

    $.expr[':'].button = function (iDOM) {

        var iName = iDOM.tagName.toLowerCase();

        return  (iName == 'button')  ||  (
            (iName == 'input')  &&  (iDOM.type.toLowerCase() in pButton)
        );
    };

    /* ----- :input ----- */

    var pInput = $.makeSet('input', 'textarea', 'button', 'select');

    $.expr[':'].input = function (iDOM) {

        return  (iDOM.tagName.toLowerCase() in pInput)  ||
            (typeof iDOM.getAttribute('contentEditable') === 'string')  ||
            iDOM.designMode;
    };

/* ---------- iQuery Extended Pseudo ---------- */

    /* ----- :indeterminate ----- */

    var Check_Type = $.makeSet('radio', 'checkbox');

    $.expr[':'].indeterminate = function (iDOM) {

        switch ( iDOM.tagName.toLowerCase() ) {
            case 'input':
                if (! (iDOM.type in Check_Type))  break;
            case 'progress':
                return  (iDOM.indeterminate === true);
        }
    };

    /* ----- :list, :data ----- */

    var pList = $.makeSet('ul', 'ol', 'dl', 'tbody', 'select', 'datalist');

    $.extend($.expr[':'], {
        list:    function () {

            return  (arguments[0].tagName.toLowerCase() in pList);
        },
        data:    function (iDOM, Index, iMatch) {

            return  Boolean($( iDOM ).data( iMatch[3] ));
        }
    });

    /* ----- :focusable ----- */

    var pFocusable = [
            'a[href],  map[name] area[href]',
            'label, input, textarea, button, select, option, object',
            '*[tabIndex], *[contentEditable]'
        ].join(', ');

    $.expr[':'].focusable = function () {

        return  arguments[0].matches( pFocusable );
    };

    /* ----- :field ----- */

    $.expr[':'].field = function (iDOM) {
        return (
            iDOM.getAttribute('name')  &&  $.expr[':'].input( iDOM )
        )  &&  !(
            iDOM.disabled  ||
            $.expr[':'].button( iDOM )  ||
            $( iDOM ).parents('fieldset[disabled]')[0]
        )
    };

    /* ----- :scrollable ----- */

    var Rolling_Style = $.makeSet('auto', 'scroll');

    $.expr[':'].scrollable = function (iDOM) {

        if (iDOM === iDOM.ownerDocument.scrollingElement)  return true;

        var iCSS = $( iDOM ).css([
                'width',       'height',
                'max-width',   'max-height',
                'overflow-x',  'overflow-y'
            ]);

        return (
            (
                (parseFloat( iCSS.width )  ||  parseFloat( iCSS['max-width'] ))  &&
                (iCSS['overflow-x'] in Rolling_Style)
            )  ||
            (
                (parseFloat( iCSS.height )  ||  parseFloat( iCSS['max-height'] ))  &&
                (iCSS['overflow-y'] in Rolling_Style)
            )
        );
    };

    /* ----- :media ----- */

    var pMedia = $.makeSet('iframe', 'object', 'embed', 'audio', 'video');

    $.expr[':'].media = function (iDOM) {

        return  (iDOM.tagName in pMedia)  ||  $.expr[':'].image( iDOM );
    };

    /* ----- :loaded ----- */

    $.expr[':'].loaded = function (iDOM) {

        return  iDOM.complete ||                    //  <img />
            (iDOM.readyState === 'complete')  ||    //  document
            (iDOM.readyState > 0);                  //  <audio />  &  <video />
    };
});
