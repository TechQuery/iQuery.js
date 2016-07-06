define(['jquery'],  function ($) {

    var BOM = self,  DOM = self.document;

    if ($.browser.modern)  return;

    DOM.defaultView = DOM.parentWindow;


/* ---------- DOM ShortCut ---------- */

    var iGetter = {
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
        },
        DOM_Proto = Element.prototype;

    for (var iName in iGetter)
        Object.defineProperty(DOM_Proto,  iName,  {get: iGetter[iName]});


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
                this[iAlias[iName]]  :  Get_Attribute.call(this, iName,  0);
        },
        setAttribute:    function (iName, iValue) {
            if (iAlias[iName])
                this[iAlias[iName]] = iValue;
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
        var iValue = this[iName];
        var iNumber = parseFloat(iValue);

        if (isNaN( iNumber ))  return;

        if (iNumber !== 0)
            switch (ValueUnit( iValue )) {
                case 'em':    {
                    var Font_Size =
                        this.ownerNode.parentNode.currentStyle.fontSize;

                    iNumber *= parseFloat(Font_Size);

                    if (ValueUnit(Font_Size) != 'pt')  break;
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
                ('pixel-' + iName).toCamelCase()
            ];
            this[iName] = (typeof this[iName] == 'number')  ?
                (this[iName] + 'px')  :  (iStyle[iName] + '');

            if (typeof this[iName] == 'string')  toPX.call(this, iName);

            this.cssText += [
                iName,  ': ',  this[iName],  '; '
            ].join('');
        }

        this.cssText = this.cssText.trim();

        var iAlpha = iDOM.filters.Alpha  ||  iDOM.filters[DX_Filter + 'Alpha'];

        this.opacity = (iAlpha  ?  (iAlpha.opacity / 100)  :  1)  +  '';
    }

    CSSStyleDeclaration.prototype.getPropertyValue = function () {
        return  this[ arguments[0].toCamelCase() ];
    };

    BOM.getComputedStyle = function () {
        return  new CSSStyleDeclaration(arguments[0]);
    };

/* ---------- Set Style ---------- */

    function toHexInt(iDec, iLength) {
        var iHex = parseInt( Number(iDec).toFixed(0) ).toString(16);

        if (iLength && (iLength > iHex.length))
            iHex = '0'.repeat(iLength - iHex.length) + iHex;

        return iHex;
    }

    function RGB_Hex(iRed, iGreen, iBlue) {
        var iArgs = $.makeArray(arguments);

        if ((iArgs.length == 1) && (typeof iArgs[0] == 'string'))
            iArgs = iArgs[0].replace(/rgb\(([^\)]+)\)/i, '$1').replace(/,\s*/g, ',').split(',');

        for (var i = 0;  i < 3;  i++)
            iArgs[i] = toHexInt(iArgs[i], 2);
        return iArgs.join('');
    }

    DOM.documentElement.style.constructor.prototype.setProperty =
        function (iName, iValue) {
            var iString = '',  iWrapper,  iScale = 1,  iConvert;

            var iRGBA = (typeof iValue == 'string')  &&
                    iValue.match(/\s*rgba\(([^\)]+),\s*(\d\.\d+)\)/i);

            if (iName == 'opacity') {
                iName = 'filter';
                iWrapper = 'progid:' + DX_Filter + 'Alpha(opacity={n})';
                iScale = 100;
            } else if (iRGBA) {
                iString = iValue.replace(iRGBA[0], '');
                if (iString)
                    iString += arguments.callee.call(this, iName, iString);
                if (iName != 'background')
                    iString += arguments.callee.apply(this, [
                        (iName.indexOf('-color') > -1) ? iName : (iName + '-color'),
                        'rgb(' + iRGBA[1] + ')'
                    ]);
                iName = 'filter';
                iWrapper = 'progid:' + DX_Filter +
                    'Gradient(startColorStr=#{n},endColorStr=#{n})';
                iConvert = function (iAlpha, iRGB) {
                    return  toHexInt(parseFloat(iAlpha) * 256, 2) + RGB_Hex(iRGB);
                };
            }
            if (iWrapper)
                iValue = iWrapper.replace(
                    /\{n\}/g,
                    iConvert  ?  iConvert(iRGBA[2], iRGBA[1])  :  (iValue * iScale)
                );

            this.setAttribute(iName, iValue, arguments[2]);
        };

/* ---------- DOM Event ---------- */

    var $_DOM = $(DOM);

    //  DOM Content Loading
    if (BOM === BOM.top)
        $.every(0.01, function () {
            try {
                DOM.documentElement.doScroll('left');
                $_DOM.trigger('DOMContentLoaded');
                return false;
            } catch (iError) {
                return;
            }
        });
    //  Patch for Change Event
    var $_Change_Target = 'input[type="radio"], input[type="checkbox"]';

    $_DOM.on('click',  $_Change_Target,  function () {
        this.blur();
        this.focus();
    }).on('click',  'label',  function () {
        var $_This = $(this);
        var _ID_ = $_This.attr('for');

        if (_ID_)
            $('input[id="' + _ID_ + '"]')[0].click();
        else
            $_This.find($_Change_Target).click();
    });

    //  Submit & Reset  Bubble
    function Event_Hijack(iEvent) {
        iEvent.preventDefault();

        this[iEvent.type]();
    }

    $_DOM.on('click',  'input, button',  function () {

        if ( this.type.match(/submit|reset/) )
            $(this.form).one(this.type, Event_Hijack);

    }).on('keydown',  'form input, form select',  function () {

        if ((this.type != 'button')  &&  (arguments[0].which == 13))
            $(this.form).one((this.type == 'reset') ? 'reset' : 'submit',  Event_Hijack);
    });

    var $_BOM = $(BOM),
        _Submit_ = HTMLFormElement.prototype.submit,
        _Reset_ = HTMLFormElement.prototype.reset;

    function Fake_Bubble(iType, iMethod) {
        var $_This = $(this);

        $_BOM.on(iType,  function (iEvent) {
            if (iEvent.target !== $_This[0])  return;

            if (! iEvent.defaultPrevented)  iMethod.call(iEvent.target);

            $_BOM.off(iType, arguments.callee);
        });

        var iEvent = arguments.callee.caller.arguments[0];

        BOM.setTimeout(function () {
            $.event.dispatch(
                ((iEvent instanceof $.Event)  &&  (iEvent.type == iType))  ?
                    iEvent : {
                        type:      iType,
                        target:    $_This[0]
                    }
            );
        });
    }
    $.extend(HTMLFormElement.prototype, {
        submit:    $.proxy(Fake_Bubble, null, 'submit', _Submit_),
        reset:     $.proxy(Fake_Bubble, null, 'reset', _Reset_)
    });

/* ---------- XML DOM Parser ---------- */

    var IE_DOMParser = (function () {
            for (var i = 0;  arguments[i];  i++)  try {
                new  ActiveXObject( arguments[i] );
                return arguments[i];
            } catch (iError) { }
        })(
            'MSXML2.DOMDocument.6.0', 'MSXML2.DOMDocument.5.0',
            'MSXML2.DOMDocument.4.0', 'MSXML2.DOMDocument.3.0',
            'MSXML2.DOMDocument',     'Microsoft.XMLDOM'
        );

    function XML_Create() {
        var iXML = new ActiveXObject(IE_DOMParser);
        iXML.async = false;
        iXML.loadXML(arguments[0]);
        return iXML;
    }

    BOM.DOMParser = function () { };

    BOM.DOMParser.prototype.parseFromString = function () {
        var iXML = XML_Create(arguments[0]);

        if (iXML.parseError.errorCode)
            iXML = XML_Create([
                '<xml><parsererror><h3>This page contains the following errors:</h3><div>',
                iXML.parseError.reason,
                '</div></parsererror></xml>'
            ].join(''));

        return iXML;
    };

});