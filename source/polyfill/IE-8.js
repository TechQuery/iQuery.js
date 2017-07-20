define(['../utility/ext/string'],  function ($) {

    var BOM = self,  DOM = self.document;

    if ( $.browser.modern )  return;


/* ---------- Document ShortCut ---------- */

    DOM.defaultView = DOM.parentWindow;

    DOM.head = DOM.documentElement.firstChild;


/* ---------- DOM ShortCut ---------- */

    var DOM_Proto = Element.prototype,
        Text_Proto = Object.getPrototypeOf( DOM.createTextNode('') );

    $.each({
        firstElementChild:         function () {
            return this.children[0];
        },
        lastElementChild:          function () {

            return  this.children[this.children.length - 1];
        },
        previousElementSibling:    function () {

            return  $.trace(this,  'previousSibling',  1,  function () {

                return  (this.nodeType == 1);
            })[0];
        },
        nextElementSibling:        function () {

            return  $.trace(this,  'nextSibling',  function () {

                return  (this.nodeType == 1);
            })[0];
        }
    },  function (key) {

        Object.defineProperty(DOM_Proto,  key,  {get: this});

        if (key.indexOf('Sibling') > 0)
            Object.defineProperty(Text_Proto,  key,  {get: this});
    });

/* ---------- DOM Text Content ---------- */

    Object.defineProperty(DOM_Proto, 'textContent', {
        get:    function () {

            return this.innerText;
        },
        set:    function (iText) {

            switch ( this.tagName.toLowerCase() ) {
                case 'style':     return  this.styleSheet.cssText = iText;
                case 'script':    return  this.text = iText;
            }
            this.innerText = iText;
        }
    });

/* ---------- DOM Attribute Name ---------- */

    var iAlias = {
            'class':    'className',
            'for':      'htmlFor'
        },
        Get_Attribute = DOM_Proto.getAttribute,
        Set_Attribute = DOM_Proto.setAttribute,
        Remove_Attribute = DOM_Proto.removeAttribute;

    $.extend(DOM_Proto, {
        getAttribute:    function (iName) {

            return  iAlias[iName] ?
                this[ iAlias[iName] ]  :  Get_Attribute.call(this, iName,  0);
        },
        setAttribute:    function (iName, iValue) {

            if (iAlias[iName])
                this[ iAlias[iName] ] = iValue;
            else
                Set_Attribute.call(this, iName, iValue,  0);
        },
        removeAttribute:    function (iName) {

            return  Remove_Attribute.call(this,  iAlias[iName] || iName,  0);
        }
    });

/* ---------- Computed Style ---------- */

    var PX_Attr = $.makeSet('left', 'right', 'top', 'bottom', 'width', 'height'),
        DX_Filter = 'DXImageTransform.Microsoft.';

    function ValueUnit(iValue) {

        return  iValue.slice((parseFloat(iValue) + '').length);
    }

    function toPX(iName) {

        var iValue = this[iName];    var iNumber = parseFloat( iValue );

        if (isNaN( iNumber ))  return;

        if ( iNumber )
            switch (ValueUnit( iValue )) {
                case 'em':    {
                    var Font_Size =
                        this.ownerNode.parentNode.currentStyle.fontSize;

                    iNumber *= parseFloat( Font_Size );

                    if (ValueUnit( Font_Size )  !=  'pt')  break;
                }
                case 'pt':    iNumber *= (BOM.screen.deviceXDPI / 72);    break;
                default:      return;
            }

        this[iName] = iNumber + 'px';
    }

    function CSSStyleDeclaration(iDOM) {

        var iStyle = iDOM.currentStyle;

        $.extend(this, {
            length:       0,
            cssText:      '',
            ownerNode:    iDOM
        });

        for (var iName in iStyle) {

            this[iName] = (iName in PX_Attr)  &&  iStyle[
                $.camelCase('pixel-' + iName)
            ];

            this[iName] = (typeof this[iName] === 'number')  ?
                (this[iName] + 'px')  :  (iStyle[iName] + '');

            if (typeof this[iName] === 'string')  toPX.call(this, iName);

            this.cssText += [iName,  ': ',  this[ iName ],  '; '].join('');
        }

        this.cssText = this.cssText.trim();

        var iAlpha = iDOM.filters.Alpha  ||  iDOM.filters[DX_Filter + 'Alpha'];

        this.opacity = (iAlpha  ?  (iAlpha.opacity / 100)  :  1)  +  '';
    }

    CSSStyleDeclaration.prototype.getPropertyValue = function () {

        return  this[$.camelCase( arguments[0] )];
    };

    BOM.getComputedStyle = function () {

        return  new CSSStyleDeclaration( arguments[0] );
    };

/* ---------- Set Style ---------- */

    function toHexInt(iDec, iLength) {

        return $.leftPad(
            parseInt( Number(iDec).toFixed(0) ).toString(16),  iLength || 2
        );
    }

    function RGB_Hex(iRed, iGreen, iBlue) {

        var iArgs = $.makeArray( arguments );

        if ((iArgs.length < 2)  &&  (typeof iArgs[0] === 'string'))
            iArgs = iArgs[0].replace(/rgb\(([^\)]+)\)/i, '$1')
                .replace(/,\s*/g, ',').split(',');

        for (var i = 0;  i < 3;  i++)  iArgs[i] = toHexInt( iArgs[i] );

        return iArgs.join('');
    }

    Object.getPrototypeOf( DOM.documentElement.style ).setProperty =
        function setProperty(iName, iValue) {

            var iString = '',  iWrapper,  iScale = 1,  iConvert;

            var iRGBA = (typeof iValue === 'string')  &&
                    iValue.match( /\s*rgba\(([^\)]+),\s*(\d\.\d+)\)/i );

            if (iName === 'opacity') {

                iName = 'filter',  iScale = 100;

                iWrapper = 'progid:' + DX_Filter + 'Alpha(opacity={n})';

            } else if ( iRGBA ) {

                iString = iValue.replace(iRGBA[0], '');

                if ( iString )
                    iString += setProperty.call(this, iName, iString);

                if (iName != 'background')
                    iString += setProperty.apply(this, [
                        (iName.indexOf('-color') > -1) ? iName : (iName + '-color'),
                        'rgb(' + iRGBA[1] + ')'
                    ]);

                iName = 'filter';

                iWrapper = 'progid:' + DX_Filter +
                    'Gradient(startColorStr=#{n},endColorStr=#{n})';

                iConvert = function (iAlpha, iRGB) {

                    return  toHexInt(parseFloat(iAlpha) * 256)  +  RGB_Hex( iRGB );
                };
            }

            if ( iWrapper )
                iValue = iWrapper.replace(
                    /\{n\}/g,
                    iConvert  ?  iConvert(iRGBA[2], iRGBA[1])  :  (iValue * iScale)
                );

            this.setAttribute(iName, iValue, arguments[2]);
        };

/* ---------- DOM Event ---------- */

    var KeyMap = {X: 'Left',  Y: 'Top'};

    function pageCoord(key) {

        key = key.slice( -1 );

        var name = 'scroll'  +  KeyMap[ key ];

        return  this['client' + key]  +  Math.max(
            document.documentElement[ name ],  document.body[ name ]
        );
    }

    var Event_Property = {
            target:    'srcElement',
            which:     function () {

                return  (this.type.slice(0, 3) === 'key')  ?
                    this.keyCode  :  [0, 1, 3, 0, 2, 0, 0, 0][ this.button ];
            },
            pageX:     pageCoord,
            pageY:     pageCoord
        };

    $.extend(Event.prototype, {
        preventDefault:     function () {

            this.returnValue = false;
        },
        stopPropagation:    function () {

            this.cancelBubble = true;
        },
        valueOf:            function () {
            var event = { };

            for (var key in this) {

                switch ($.Type( this[key] )) {
                    case 'Window':         ;
                    case 'Document':       ;
                    case 'HTMLElement':    if (Event_Property[ key ])  break;
                    case 'Function':       ;
                    default:               if (! Event_Property[ key ])  continue;
                }

                event[ type ] = (Event_Property[ key ]  instanceof  Function)  ?
                    Event_Property[ key ].call(this, key)  :
                    this[ Event_Property[ key ] ];
            }

            return event;
        }
    });

/* ---------- XML DOM Parser ---------- */

    var IE_DOMParser = (function () {

            for (var i = 0;  arguments[i];  i++)  try {

                return  new ActiveXObject( arguments[i] )  &&  arguments[i];

            } catch (iError) { }
        })(
            'MSXML2.DOMDocument.6.0', 'MSXML2.DOMDocument.5.0',
            'MSXML2.DOMDocument.4.0', 'MSXML2.DOMDocument.3.0',
            'MSXML2.DOMDocument',     'Microsoft.XMLDOM'
        );

    function XML_Create() {

        var iXML = new ActiveXObject( IE_DOMParser );

        iXML.async = false;

        iXML.loadXML( arguments[0] );

        return iXML;
    }

    BOM.DOMParser = function () { };

    BOM.DOMParser.prototype.parseFromString = function () {

        var iXML = XML_Create( arguments[0] );

        if ( iXML.parseError.errorCode )
            iXML = XML_Create([
                '<xml><parsererror><h3>This page contains the following errors:</h3><div>',
                iXML.parseError.reason,
                '</div></parsererror></xml>'
            ].join(''));

        return iXML;
    };

});