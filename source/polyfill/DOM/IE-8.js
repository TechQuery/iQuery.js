define([
    '../../iQuery', '../../utility/ext/browser', '../../utility/ext/string'
],  function ($) {

    var BOM = self,  DOM = self.document;

    if ( $.browser.modern )  return;


/* ---------- Global property ---------- */

    BOM.Document = DOM.constructor;

    BOM.Text = DOM.createTextNode('').constructor;

    BOM.Comment = DOM.createComment('').constructor;

    $.each({
        defaultView:    function () {

            return  this.parentWindow;
        },
        head:           function () {

            return  this.documentElement ? this.documentElement.firstChild : null;
        }
    },  function (key) {

        Object.defineProperty(Document.prototype,  key,  {get: this});
    });

/* ---------- DOM ShortCut ---------- */

    var DOM_Proto = Element.prototype;

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

        var config = {get: this};

        Object.defineProperty(DOM_Proto, key, config);

        if (key.indexOf('Sibling') > 0)
            Object.defineProperty(Text.prototype, key, config);
    });

/* ---------- DOM Text Content ---------- */

    Object.defineProperty(DOM_Proto, 'textContent', {
        get:    function () {

            return  $.mapTree(this,  'childNodes',  function (node) {

                return  (node.nodeType === 3)  ?  node.nodeValue  :  '';

            }).join('');
        },
        set:    function (text) {

            if (this.tagName.toLowerCase() !== 'style')
                this.innerText = text;
            else
                this.styleSheet.cssText = text;
        }
    });

    var textContent = {
            get:    function () {  return this.nodeValue;  },
            set:    function (text) {  this.nodeValue = text;  }
        };

    Object.defineProperty(Text.prototype, 'textContent', textContent);

    Object.defineProperty(Comment.prototype, 'textContent', textContent);


/* ---------- DOM Attribute Name ---------- */

    var alias = {
            'class':    'className',
            'for':      'htmlFor'
        },
        Get_Attribute = DOM_Proto.getAttribute,
        Set_Attribute = DOM_Proto.setAttribute,
        Remove_Attribute = DOM_Proto.removeAttribute;

    $.extend(DOM_Proto, {
        getAttribute:    function (name) {

            return  alias[name] ?
                this[ alias[name] ]  :  Get_Attribute.call(this, name,  0);
        },
        setAttribute:    function (name, value) {

            if (alias[name])
                this[ alias[name] ] = value;
            else
                Set_Attribute.call(this, name, value,  0);
        },
        removeAttribute:    function (name) {

            return  Remove_Attribute.call(this,  alias[name] || name,  0);
        }
    });

/* ---------- Computed Style ---------- */

    var PX_Attr = $.makeSet('left', 'right', 'top', 'bottom', 'width', 'height'),
        DX_Filter = 'DXImageTransform.Microsoft.';

    function ValueUnit(value) {

        return  value.slice((parseFloat(value) + '').length);
    }

    function toPX(name) {

        var value = this[name];    var number = parseFloat( value );

        if (isNaN( number ))  return;

        if ( number )
            switch (ValueUnit( value )) {
                case 'em':    {
                    var Font_Size =
                        this.ownerNode.parentNode.currentStyle.fontSize;

                    number *= parseFloat( Font_Size );

                    if (ValueUnit( Font_Size )  !=  'pt')  break;
                }
                case 'pt':    number *= (BOM.screen.deviceXDPI / 72);    break;
                default:      return;
            }

        this[name] = number + 'px';
    }

    function CSSStyleDeclaration(element) {

        var style = element.currentStyle;

        $.extend(this, {
            length:       0,
            cssText:      '',
            ownerNode:    element
        });

        for (var name in style) {

            this[name] = (name in PX_Attr)  &&  style[
                $.camelCase('pixel-' + name)
            ];

            this[name] = (typeof this[name] === 'number')  ?
                (this[name] + 'px')  :  (style[name] + '');

            if (typeof this[name] === 'string')  toPX.call(this, name);

            this.cssText += name  +  ': '  +  this[ name ]  +  '; ';
        }

        this.cssText = this.cssText.trim();

        var alpha = element.filters.Alpha ||
                element.filters[DX_Filter + 'Alpha'];

        this.opacity = (alpha  ?  (alpha.opacity / 100)  :  1)  +  '';
    }

    CSSStyleDeclaration.prototype.getPropertyValue = function (name) {

        return  this[$.camelCase( name )];
    };

    BOM.CSSStyleDeclaration = CSSStyleDeclaration;

    BOM.getComputedStyle = function () {

        return  new CSSStyleDeclaration( arguments[0] );
    };

/* ---------- Set Style ---------- */

    function toHexInt(decimal, length) {

        return  parseInt( Number( decimal ).toFixed(0) )
            .toString(16).padStart(length || 2,  0);
    }

    function RGB_Hex(red, green, blue) {

        return Array.from(
            ((arguments.length > 1)  ||  (typeof red !== 'string'))  ?
                arguments  :
                red.replace(/rgb\(([^\)]+)\)/i, '$1')
                    .replace(/,\s*/g, ',').split(','),
            toHexInt
        ).join('');
    }

    function setProperty(name, value) {

        var string = '',  wrapper,  scale = 1,  convert;

        var RGBA = (typeof value === 'string')  &&
                value.match( /\s*rgba\(([^\)]+),\s*(\d\.\d+)\)/i );

        if (name === 'opacity') {

            name = 'filter',  scale = 100;

            wrapper = 'progid:' + DX_Filter + 'Alpha(opacity={n})';

        } else if ( RGBA ) {

            string = value.replace(RGBA[0], '');

            if ( string )
                string += setProperty.call(this, name, string);

            if (name != 'background')
                string += setProperty.apply(this, [
                    (name.indexOf('-color') > -1) ? name : (name + '-color'),
                    'rgb(' + RGBA[1] + ')'
                ]);

            name = 'filter';

            wrapper = 'progid:' + DX_Filter +
                'Gradient(startColorStr=#{n},endColorStr=#{n})';

            convert = function (alpha, RGB) {

                return  toHexInt(parseFloat(alpha) * 256)  +  RGB_Hex( RGB );
            };
        }

        if ( wrapper )
            value = wrapper.replace(
                /\{n\}/g,
                convert  ?  convert(RGBA[2], RGBA[1])  :  (value * scale)
            );

        this.setAttribute(name, value, arguments[2]);
    }

    Object.getPrototypeOf( DOM.documentElement.style ).setProperty =
        CSSStyleDeclaration.prototype.setProperty = setProperty;


/* ---------- DOM Event ---------- */

    var KeyMap = {X: 'Left',  Y: 'Top'};

    function pageCoord(key) {

        key = key.slice( -1 );

        var name = 'scroll'  +  KeyMap[ key ];

        return  this['client' + key]  +  Math.max(
            DOM.documentElement[ name ],  DOM.body[ name ]
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

/* ---------- Document Implementation ---------- */

    var Class = {
            XML:     (function () {

                for (var i = 0;  arguments[i];  i++)  try {

                    if (new BOM.ActiveXObject( arguments[i] ))
                        return arguments[i];

                } catch (iError) { }
            })(
                'MSXML2.DOMDocument.6.0', 'MSXML2.DOMDocument.5.0',
                'MSXML2.DOMDocument.4.0', 'MSXML2.DOMDocument.3.0',
                'MSXML2.DOMDocument',     'Microsoft.XMLDOM'
            ),
            HTML:    'HTMLFile'
        };

    BOM.DOMImplementation = DOM.implementation.constructor;

    $.extend(DOMImplementation.prototype, {
        createDocument:        function (nameSpace, rootName, docType) {

            var document = new BOM.ActiveXObject( Class.XML );

            if ( rootName )
                document.appendChild(
                    document.createElementNS(nameSpace, rootName)
                );

            return document;
        },
        createHTMLDocument:    function (title) {

            var document = new BOM.ActiveXObject( Class.HTML );

            document.write(
                '<html><head><title>'  +
                    (title || '')  +
                '</title></head><body /></html>'
            );

            return document;
        }
    });

/* ---------- Document Serialize ---------- */

    function XMLSerializer() { }

    XMLSerializer.prototype.serializeToString = function (node) {

        return node.xml;
    };

    BOM.XMLSerializer = XMLSerializer;

});
