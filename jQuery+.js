if ((typeof this.define != 'function')  ||  (! this.define.amd))
    this.define = function () {
        return  arguments[arguments.length - 1]();
    };

define('jQuery+',  function () {

    var iQuery = {fn:  { }};


(function (BOM) {

    /* ----- Object Patch ----- */

    if (! Object.getOwnPropertyNames)
        Object.getOwnPropertyNames = function (iObject) {
            var iKey = [ ];

            for (var _Key_ in iObject)
                if ( this.prototype.hasOwnProperty.call(iObject, _Key_) )
                    iKey.push(_Key_);

            return iKey;
        };

    /* ----- String Extension ----- */

    if (! ''.trim)
        var Blank_Char = /(^\s*)|(\s*$)/g;
    else
        var _Trim_ = ''.trim;

    String.prototype.trim = function (iChar) {
        if (! iChar)
            return  Blank_Char ? this.replace(Blank_Char, '') : _Trim_.call(this);
        else {
            for (var i = 0, a = 0, b;  i < iChar.length;  i++) {
                if ((this[0] == iChar[i]) && (! a))
                    a = 1;
                if ((this[this.length - 1] == iChar[i]) && (! b))
                    b = -1;
            }
            return this.slice(a, b);
        }
    };

    if (! ''.repeat)
        String.prototype.repeat = function (Times) {
            return  (new Array(Times + 1)).join(this);
        };

    String.prototype.toCamelCase = function () {
        var iName = this.split(arguments[0] || '-');

        for (var i = 1;  i < iName.length;  i++)
            iName[i] = iName[i][0].toUpperCase() + iName[i].slice(1);

        return iName.join('');
    };

    String.prototype.toHyphenCase = function () {
        return  this.replace(/([a-z0-9])[\s_]?([A-Z])/g,  function () {
            return  arguments[1] + '-' + arguments[2].toLowerCase();
        });
    };

    /* ----- Array Extension ----- */

    if (! [ ].indexOf)
        Array.prototype.indexOf = function () {
            for (var i = 0;  i < this.length;  i++)
                if (arguments[0] === this[i])
                    return i;

            return -1;
        };

    if (! [ ].reduce)
        Array.prototype.reduce = function () {
            var iResult = arguments[1];

            for (var i = 1;  i < this.length;  i++) {
                if (i == 1)  iResult = this[0];

                iResult = arguments[0](iResult, this[i], i, this);
            }

            return iResult;
        };

    /* ----- Date Extension ----- */

    if (! Date.now)
        Date.now = function () {
            return  (new Date()).getTime();
        };

    /* ----- JSON Extension  v0.4 ----- */

    BOM.JSON.format = function () {
        return  this.stringify(arguments[0], null, 4)
            .replace(/(\s+"[^"]+":) ([^\s]+)/g, '$1    $2');
    };

    BOM.JSON.parseAll = function (iJSON) {
        return  BOM.JSON.parse(iJSON,  function (iKey, iValue) {
            if (iKey && (typeof iValue == 'string'))  try {
                return  BOM.JSON.parse(iValue);
            } catch (iError) { }

            return iValue;
        });
    };

    /* ----- BOM/DOM Fix  v0.4 ----- */

    BOM.new_Window_Fix = function (Fix_More) {
        if (! this)  return false;

        try {
            var _Window_ = this.opener,
                This_DOM = this.document;

            This_DOM.defaultView = this;

            if (_Window_ && (this.location.href == 'about:blank'))
                This_DOM.domain = _Window_.document.domain;

            if ((_Window_ || this).navigator.userAgent.match(/MSIE 8/i))
                This_DOM.head = This_DOM.documentElement.firstChild;
        } catch (iError) {
            return false;
        }
        if (Fix_More)  Fix_More.call(this);

        return true;
    };

    BOM.new_Window_Fix();


    if (console)  return;

    function _Notice_() {
        var iString = [ ];

        for (var i = 0, j = 0;  i < arguments.length;  i++)  try {
            iString[j++] = BOM.JSON.stringify( arguments[i].valueOf() );
        } catch (iError) {
            iString[j++] = arguments[i];
        }

        BOM.status = iString.join(' ');
    }

    BOM.console = { };

    var Console_Method = ['log', 'info', 'warn', 'error', 'dir'];

    for (var i = 0;  i < Console_Method.length;  i++)
        BOM.console[ Console_Method[i] ] = _Notice_;

})(self);



(function (BOM, DOM, $) {

    var UA = BOM.navigator.userAgent;

    var is_Trident = UA.match(/MSIE (\d+)|Trident[^\)]+rv:(\d+)/i),
        is_Gecko = UA.match(/; rv:(\d+)[^\/]+Gecko\/\d+/),
        is_Webkit = UA.match(/AppleWebkit\/(\d+\.\d+)/i);
    var IE_Ver = is_Trident ? Number(is_Trident[1] || is_Trident[2]) : NaN,
        FF_Ver = is_Gecko ? Number(is_Gecko[1]) : NaN,
        WK_Ver = is_Webkit ? parseFloat(is_Webkit[1]) : NaN;

    var is_Pad = UA.match(/Tablet|Pad|Book|Android 3/i),
        is_Phone = UA.match(/Phone|Touch|Android 2|Symbian/i);
    var is_Mobile = (
            is_Pad || is_Phone || UA.match(/Mobile/i)
        ) && (! UA.match(/ PC /));

    var is_iOS = UA.match(/(iTouch|iPhone|iPad|iWatch);[^\)]+CPU[^\)]+OS (\d+_\d+)/i),
        is_Android = UA.match(/(Android |Silk\/)(\d+\.\d+)/i);

    $.browser = {
        msie:             IE_Ver,
        mozilla:          FF_Ver,
        webkit:           WK_Ver,
        modern:           !  (IE_Ver < 9),
        mobile:           !! is_Mobile,
        pad:              !! is_Pad,
        phone:            !! is_Phone,
        ios:              is_iOS  ?  parseFloat( is_iOS[2].replace('_', '.') )  :  NaN,
        android:          is_Android ? parseFloat(is_Android[2]) : NaN,
        versionNumber:    IE_Ver || FF_Ver || WK_Ver
    };

})(self, self.document, iQuery);



(function (BOM, DOM, $) {

    $.likeArray = function (iObject) {
        if ((! iObject)  ||  (typeof iObject != 'object'))
            return false;

        iObject = (typeof iObject.valueOf == 'function')  ?
            iObject.valueOf() : iObject;

        return Boolean(
            iObject  &&
            (typeof iObject.length == 'number')  &&
            (typeof iObject != 'string')
        );
    };

    $.makeSet = function () {
        var iArgs = arguments,  iValue = true,  iSet = { };

        if (this.likeArray( iArgs[1] )) {
            iValue = iArgs[0];
            iArgs = iArgs[1];
        } else if (this.likeArray( iArgs[0] )) {
            iValue = iArgs[1];
            iArgs = iArgs[0];
        }

        for (var i = 0;  i < iArgs.length;  i++)
            iSet[ iArgs[i] ] = (typeof iValue == 'function')  ?
                iValue() : iValue;

        return iSet;
    };

    var DataType = $.makeSet('string', 'number', 'boolean');

    $.isData = function (iValue) {
        var iType = typeof iValue;

        return  Boolean(iValue)  ||  (iType in DataType)  ||  (
            (iValue !== null)  &&  (iType == 'object')  &&
            (typeof iValue.valueOf() in DataType)
        );
    };

    $.isEqual = function (iLeft, iRight) {
        if (!  (iLeft && iRight))
            return  (iLeft == iRight);

        iLeft = iLeft.valueOf();
        iRight = iRight.valueOf();

        if (iLeft == iRight)  return true;
        if (! (
            (iLeft instanceof Object)  &&  (iRight instanceof Object)
        ))
            return false;

        var Left_Key = Object.getOwnPropertyNames(iLeft),
            Right_Key = Object.getOwnPropertyNames(iRight);

        if (Left_Key.length != Right_Key.length)  return false;

        for (var i = 0, _Key_;  i < Left_Key.length;  i++) {
            _Key_ = Left_Key[i];

            if (! (
                (_Key_ in iRight)  &&
                arguments.callee.call(this, iLeft[_Key_], iRight[_Key_])
            ))
                return false;
        }
        return true;
    };

    $.trace = function (iObject, iName, iCount, iCallback) {
        if (typeof iCount == 'function')  iCallback = iCount;
        iCount = parseInt(iCount);
        iCount = isNaN(iCount) ? Infinity : iCount;

        var iResult = [ ];

        for (
            var _Next_,  i = 0,  j = 0;
            iObject[iName]  &&  (j < iCount);
            iObject = _Next_,  i++
        ) {
            _Next_ = iObject[iName];
            if (
                (typeof iCallback != 'function')  ||
                (iCallback.call(_Next_, i, _Next_)  !==  false)
            )
                iResult[j++] = _Next_;
        }

        return iResult;
    };

    $.intersect = function () {
        if (arguments.length < 2)  return arguments[0];

        var iArgs = this.makeArray( arguments );
        var iArray = this.likeArray( iArgs[0] );

        iArgs[0] = this.map(iArgs.shift(),  function (iValue, iKey) {
            if ( iArray ) {
                if (iArgs.indexOf.call(iArgs[0], iValue)  >  -1)
                    return iValue;
            } else if (
                (iArgs[0][iKey] !== undefined)  &&
                (iArgs[0][iKey] === iValue)
            )
                return iValue;
        });

        return  arguments.callee.apply(this, iArgs);
    };

})(self, self.document, iQuery);



(function (BOM, DOM, $) {

    var _Timer_ = { };

    $.extend({
        _Root_:     BOM,
        now:        Date.now,
        every:      function (iSecond, iCallback) {
            var _BOM_ = this._Root_,
                iTimeOut = (iSecond || 1) * 1000,
                iStart = this.now(),
                Index = 0;

            return  _BOM_.setTimeout(function () {
                var iDuring = (Date.now() - iStart) / 1000;

                var iReturn = iCallback.call(_BOM_, ++Index, iDuring);

                if ((typeof iReturn == 'undefined')  ||  iReturn)
                    _BOM_.setTimeout(arguments.callee, iTimeOut);
            }, iTimeOut);
        },
        wait:       function (iSecond, iCallback) {
            return  this.every(iSecond, function () {
                iCallback.apply(this, arguments);
                return false;
            });
        },
        start:      function (iName) {
            return  (_Timer_[iName] = this.now());
        },
        end:        function (iName) {
            return  (this.now() - _Timer_[iName]) / 1000;
        },
        uuid:       function () {
            return  (arguments[0] || 'uuid')  +  '_'  +
                (this.now() + Math.random()).toString(36)
                    .replace('.', '').toUpperCase();
        }
    });

})(self, self.document, iQuery);



(function (BOM, DOM, $) {

    var WindowType = $.makeSet('Window', 'DOMWindow', 'Global');

    $.extend({
        Type:    function (iVar) {
            var iType;

            try {
                iType = $.type( iVar );

                if ((iType == 'object')  &&  iVar.constructor.name)
                    iType = iVar.constructor.name;
                else
                    iType = iType[0].toUpperCase() + iType.slice(1);
            } catch (iError) {
                return 'Window';
            }

            if (! iVar)
                return  (isNaN(iVar)  &&  (iVar !== iVar))  ?  'NaN'  :  iType;

            if (WindowType[iType] || (
                (iVar == iVar.document) && (iVar.document != iVar)    //  IE 9- Hack
            ))
                return 'Window';

            if (iVar.location  &&  (iVar.location === (
                iVar.defaultView || iVar.parentWindow || { }
            ).location))
                return 'Document';

            if (
                iType.match(/HTML\w+?Element$/) ||
                (typeof iVar.tagName == 'string')
            )
                return 'HTMLElement';

            if ( this.likeArray(iVar) ) {
                iType = 'Array';
                if (! $.browser.modern)  try {
                    iVar.item();
                    try {
                        iVar.namedItem();
                        return 'HTMLCollection';
                    } catch (iError) {
                        return 'NodeList';
                    }
                } catch (iError) { }
            }

            return iType;
        },
        isSelector:       function () {
            try {
                DOM.querySelector(arguments[0])
            } catch (iError) {
                return false;
            }
            return true;
        },
        split:            function (iString, iSplit, iLimit, iJoin) {
            iString = iString.split(iSplit);
            if (iLimit) {
                iString[iLimit - 1] = iString.slice(iLimit - 1).join(
                    (typeof iJoin == 'string') ? iJoin : iSplit
                );
                iString.length = iLimit;
            }
            return iString;
        },
        byteLength:       function () {
            return  arguments[0].replace(
                /[^\u0021-\u007e\uff61-\uffef]/g,  'xx'
            ).length;
        },
        paramJSON:        function (Args_Str, iRaw) {
            Args_Str = (
                Args_Str  ?  $.split(Args_Str, '?', 2)[1]  :  BOM.location.search
            ).match(/[^\?&\s]+/g);

            if (! Args_Str)  return { };

            var _Args_ = { };

            for (var i = 0, iValue;  i < Args_Str.length;  i++) {
                Args_Str[i] = this.split(Args_Str[i], '=', 2);

                iValue = BOM.decodeURIComponent( Args_Str[i][1] );

                if (! iRaw)  try {
                    iValue = $.parseJSON(iValue);
                } catch (iError) { }

                _Args_[ Args_Str[i][0] ] = iValue;
            }

            return _Args_;
        },
        paramSign:        function (iData) {
            iData = (typeof iData == 'string')  ?  this.paramJSON(iData)  :  iData;

            return $.map(
                Object.getOwnPropertyNames(iData).sort(),
                function (iKey) {
                    switch (typeof iData[iKey]) {
                        case 'function':    return;
                        case 'object':      try {
                            return  iKey + '=' + JSON.stringify(iData[iKey]);
                        } catch (iError) { }
                    }
                    return  iKey + '=' + iData[iKey];
                }
            ).join(arguments[1] || '&');
        },
        fileName:         function () {
            return (
                arguments[0] || BOM.location.pathname
            ).match(/([^\?\#]+)(\?|\#)?/)[1].split('/').slice(-1)[0];
        },
        filePath:         function () {
            return (
                arguments[0] || BOM.location.href
            ).match(/([^\?\#]+)(\?|\#)?/)[1].split('/').slice(0, -1).join('/');
        },
        urlDomain:        function () {
            return ((
                arguments[0] || BOM.location.href
            ).match(/^(\w+:)?\/\/[^\/]+/) || [ ])[0];
        },
        isCrossDomain:    function X_Domain() {
            var iDomain = this.urlDomain( arguments[0] );

            return  iDomain && (
                iDomain != [
                    BOM.location.protocol, '//', DOM.domain, (
                        BOM.location.port  ?  (':' + BOM.location.port)  :  ''
                    )
                ].join('')
            );
        },
        cssPX:            RegExp([
            'width', 'height', 'padding', 'border-radius', 'margin',
            'top', 'right', 'bottom',  'left'
        ].join('|'))
    });

})(self, self.document, iQuery);



(function (BOM, DOM, $) {

    if ($.browser.modern)  return;

    /* ----- DOM ShortCut ----- */
    var _Children_ = Object.getOwnPropertyDescriptor(
            Element.prototype,  'children'
        );

    function HTMLCollection() {
        var iChildren = _Children_.get.call( arguments[0] );

        for (var i = 0;  i < iChildren.length;  i++) {
            this[i] = iChildren[i] || iChildren.item(i);
            if (this[i].name)  this[this[i].name] = this[i];
        }
        this.length = i;
    }

    var iGetter = {
            children:                  function () {
                return  new HTMLCollection(this);
            },
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
        };

    for (var iName in iGetter)
        Object.defineProperty(Element.prototype, iName, {
            get:    iGetter[iName]
        });


    /* ----- DOM Text Content ----- */

    Object.defineProperty(Element.prototype, 'textContent', {
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

    /* ----- DOM Selector Match ----- */

    Element.prototype.matches = function () {
        if (! this.parentNode)  $('<div />')[0].appendChild(this);

        return  ($.inArray(
            this,  this.parentNode.querySelectorAll( arguments[0] )
        ) > -1);
    };

    /* ----- DOM Attribute Name ----- */

    var iAlias = {
            'class':    'className',
            'for':      'htmlFor'
        },
        Get_Attribute = Element.prototype.getAttribute,
        Set_Attribute = Element.prototype.setAttribute,
        Remove_Attribute = Element.prototype.removeAttribute;

    $.extend(Element.prototype, {
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

    /* ----- Computed Style ----- */

    function CSSStyleDeclaration() {
        $.extend(this, arguments[0].currentStyle, {
            length:       0,
            cssText:      '',
            ownerNode:    arguments[0]
        });

        for (var iName in this) {
            this[this.length++] = iName.toHyphenCase();
            this.cssText += [
                iName,  ': ',  this[iName],  '; '
            ].join('');
        }
        this.cssText = this.cssText.trim();
    }

    var Code_Indent = ' '.repeat(4);

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

    $.extend(CSSStyleDeclaration.prototype, {
        getPropertyValue:    function (iName) {
            var iScale = 1;

            switch (iName) {
                case 'opacity':    {
                    iName = 'filter';
                    iScale = 100;
                }
            }
            var iStyle = this[ iName.toCamelCase() ];
            var iNumber = parseFloat(iStyle);

            return  isNaN(iNumber) ? iStyle : (
                (iNumber / iScale)  +  ($.cssPX[iName] ? 'px' : '')
            );
        },
        setPropertyValue:    function (iName, iValue) {
            this[this.length++] = iName;

            var iString = '',  iWrapper,  iScale = 1,  iConvert;
            if (typeof iValue == 'string')
                var iRGBA = iValue.match(/\s*rgba\(([^\)]+),\s*(\d\.\d+)\)/i);

            if (iName == 'opacity') {
                iName = 'filter';
                iWrapper = 'progid:DXImageTransform.Microsoft.Alpha(opacity={n})';
                iScale = 100;
            } else if (iRGBA) {
                iString = iValue.replace(iRGBA[0], '');
                if (iString)
                    iString += arguments.callee.call(this, arguments[0], iName, iString);
                if (iName != 'background')
                    iString += arguments.callee.call(
                        this,
                        arguments[0],
                        (iName.indexOf('-color') > -1) ? iName : (iName + '-color'),
                        'rgb(' + iRGBA[1] + ')'
                    );
                iName = 'filter';
                iWrapper = 'progid:DXImageTransform.Microsoft.Gradient(startColorStr=#{n},endColorStr=#{n})';
                iConvert = function (iAlpha, iRGB) {
                    return  toHexInt(parseFloat(iAlpha) * 256, 2) + RGB_Hex(iRGB);
                };
            }
            if (iWrapper)
                iValue = iWrapper.replace(/\{n\}/g,  iConvert ?
                      iConvert(iRGBA[2], iRGBA[1]) :
                      (iValue * iScale)
                );

            this[ this[this.length - 1].toCamelCase() ] = iValue + (arguments[2] ? ' !important' : '');

            if (this.ownerNode)
                this.ownerNode.style.setAttribute(iName,  iValue,  arguments[2] && 'important');
            else
                return  [iString, ";\n", iName, ':', Code_Indent, iValue].join('');
        }
    });

    BOM.getComputedStyle = function () {
        return  new CSSStyleDeclaration(arguments[0]);
    };

    /* ----- DOM Event ----- */

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

    /* ----- XML DOM Parser ----- */

    var IE_DOMParser = $.map([
            'MSXML2.DOMDocument.6.0',
            'MSXML2.DOMDocument.5.0',
            'MSXML2.DOMDocument.4.0',
            'MSXML2.DOMDocument.3.0',
            'MSXML2.DOMDocument',
            'Microsoft.XMLDOM'
        ],  function () {
            new ActiveXObject(arguments[0]);
            return arguments[0];
        })[0];

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

})(self, self.document, iQuery);



(function (BOM, DOM, $) {

    var iOperator = {
            '+':    function () {
                return  arguments[0] + arguments[1];
            },
            '-':    function () {
                return  arguments[0] - arguments[1];
            }
        },
        Array_Reverse = Array.prototype.reverse,
        Rolling_Style = $.makeSet('auto', 'scroll', 'hidden');

    $.fn.extend({
        reduce:           function (iMethod, iKey, iCallback) {
            if (arguments.length < 3) {
                iCallback = iKey;
                iKey = undefined;
            }
            if (typeof iCallback == 'string')  iCallback = iOperator[iCallback];

            return  $.map(this,  function () {
                return  $( arguments[0] )[iMethod](iKey);
            }).reduce(iCallback);
        },
        refresh:          function () {
            if (! this.selector)  return this;

            var $_New = $(this.selector, this.context);

            if (this.prevObject instanceof $)
                $_New = this.prevObject.pushStack($_New);

            return $_New;
        },
        sameParents:      function () {
            if (this.length < 2)  return this.parents();

            var iMin = $.trace(this[0], 'parentNode').slice(0, -1),
                iPrev;

            for (var i = 1, iLast;  i < this.length;  i++) {
                iLast = $.trace(this[i], 'parentNode').slice(0, -1);
                if (iLast.length < iMin.length) {
                    iPrev = iMin;
                    iMin = iLast;
                }
            }
            iPrev = iPrev || iLast;

            var iDiff = iPrev.length - iMin.length,  $_Result = [ ];

            for (var i = 0;  i < iMin.length;  i++)
                if (iMin[i]  ===  iPrev[i + iDiff]) {
                    $_Result = iMin.slice(i);
                    break;
                }
            return Array_Reverse.call(this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            ));
        },
        scrollParents:    function () {
            return Array_Reverse.call(this.pushStack(
                $.map(this.parents(),  function (_DOM_) {
                    var iCSS = $(_DOM_).css([
                            'width', 'max-width', 'height', 'max-height',
                            'overflow-x', 'overflow-y'
                        ]);

                    if (
                        (
                            (iCSS.width || iCSS['max-width'])  &&
                            (iCSS['overflow-x'] in Rolling_Style)
                        )  ||
                        (
                            (iCSS.height || iCSS['max-height'])  &&
                            (iCSS['overflow-y'] in Rolling_Style)
                        )
                    )
                        return _DOM_;
                })
            ));
        },
        scrollTo:         function ($_Target) {
            $_Target = $($_Target);

            this.has($_Target).each(function () {
                var $_Scroll = $(this);

                var iCoord = $($.map($_Target,  function () {
                        if ( $.contains($_Scroll[0], arguments[0]) )
                            return arguments[0];
                    })).offset(),
                    _Coord_ = $_Scroll.offset();

                if (! $_Scroll.length)  return;

                $_Scroll.animate({
                    scrollTop:
                        $_Scroll.scrollTop()  +  (iCoord.top - _Coord_.top),
                    scrollLeft:
                        $_Scroll.scrollLeft()  +  (iCoord.left - _Coord_.left)
                });
            });

            return this;
        }
    });

/* ----- DOM UI Data Operator ----- */

    var RE_URL = /^(\w+:)?\/\/[\u0021-\u007e\uff61-\uffef]+$/;

    function Value_Operator(iValue) {
        var $_This = $(this),
            End_Element = (! this.children.length);

        var _Set_ = $.isData(iValue),
            iURL = (typeof iValue == 'string')  &&  iValue.trim();
        var isURL = iURL && iURL.split('#')[0].match(RE_URL);

        switch ( this.tagName.toLowerCase() ) {
            case 'a':           {
                if (_Set_) {
                    if (isURL)  $_This.attr('href', iURL);
                    if (End_Element)  $_This.text(iValue);
                    return;
                }
                return  $_This.attr('href')  ||  (End_Element && $_This.text());
            }
            case 'img':         return  $_This.attr('src', iValue);
            case 'textarea':    ;
            case 'select':      return $_This.val(iValue);
            case 'option':      return $_This.text(iValue);
            case 'input':       {
                var _Value_ = this.value;

                if (this.getAttribute('type') != 'tel')  try {
                    _Value_ = JSON.parse(_Value_);
                } catch (iError) { }

                if ((this.type || '').match(/radio|checkbox/i)) {
                    if (_Set_) {
                        if ((! _Value_)  ||  (_Value_ == 'on'))
                            this.value = iValue;
                        else if (_Value_ === iValue)
                            this.checked = true;
                    } else
                        return  this.checked && _Value_;
                } else if (_Set_)
                    this.value = iValue;

                return _Value_;
            }
            default:            {
                if (_Set_) {
                    if ((! End_Element)  &&  isURL)
                        $_This.css('background-image',  'url("' + iURL + '")');
                    else
                        $_This.html(iValue);
                    return;
                }
                iURL = $_This.css('background-image')
                    .match(/^url\(('|")?([^'"]+)('|")?\)/);
                return  End_Element  ?  $_This.text()  :  (iURL && iURL[2]);
            }
        }
    }

    $.fn.value = function (iAttr, iFiller) {
        if (typeof iAttr == 'function') {
            iFiller = iAttr;
            iAttr = '';
        }
        var $_Value = iAttr  ?  this.filter('[' + iAttr + ']')  :  this;
        $_Value = $_Value.length  ?  $_Value  :  this.find('[' + iAttr + ']');

        if (! iFiller)  return Value_Operator.call($_Value[0]);

        var Data_Set = (typeof iFiller != 'function');

        for (var i = 0, iKey;  i < $_Value.length;  i++) {
            iKey = iAttr && $_Value[i].getAttribute(iAttr);

            Value_Operator.call(
                $_Value[i],
                Data_Set  ?  iFiller[iKey]  :  iFiller.apply($_Value[i], [
                    iKey || Value_Operator.call($_Value[i]),  i,  $_Value
                ])
            );
        }
        return this;
    };

/* ---------- HTML DOM SandBox ---------- */

    $.fn.sandBox = function () {
        var iArgs = $.makeArray(arguments);

        var iCallback = (typeof iArgs.slice(-1)[0] == 'function')  &&  iArgs.pop();
        var iHTML = $.isSelector(iArgs[0]) ? '' : iArgs.shift();
        var iSelector = iArgs[0];

        var $_iFrame = this.filter('iframe').eq(0);
        if (! $_iFrame.length)
            $_iFrame = $('<iframe style="display: none"></iframe>');

        $_iFrame.one('load',  function () {
            var _DOM_ = this.contentWindow.document;

            function Frame_Ready() {
                if (! (_DOM_.body && _DOM_.body.childNodes.length))
                    return;

                var $_Content = $(iSelector || 'body > *',  _DOM_);

                if (iCallback  &&  (false === iCallback.call(
                    $_iFrame[0],  $($.merge(
                        $.makeArray($('head style, head script',  _DOM_)),
                        $_Content[0] ? $_Content : _DOM_.body.childNodes
                    ))
                )))
                    $_iFrame.remove();

                return false;
            }

            if (! iHTML)  Frame_Ready();

            $.every(0.04, Frame_Ready);
            _DOM_.write(iHTML);
            _DOM_.close();

        }).attr('src',  ((! iHTML.match(/<.+?>/)) && iHTML.trim())  ||  'about:blank');

        return  $_iFrame[0].parentNode ? this : $_iFrame.appendTo(DOM.body);
    };

})(self, self.document, iQuery);



(function (BOM, DOM, $) {

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

/* ---------- Smart zIndex ---------- */

    function Get_zIndex() {
        var $_This = $(this);

        var _zIndex_ = $_This.css('z-index');
        if (_zIndex_ != 'auto')  return parseInt(_zIndex_);

        var $_Parents = $_This.parents();
        _zIndex_ = 0;

        $_Parents.each(function () {
            var _Index_ = $(this).css('z-index');

            _zIndex_ += (_Index_ == 'auto')  ?  1  :  parseInt(_Index_);
        });

        return ++_zIndex_;
    }

    function Set_zIndex() {
        var $_This = $(this),  _Index_ = 0;

        $_This.siblings().addBack().filter(':visible').each(function () {
            _Index_ = Math.max(_Index_, Get_zIndex.call(this));
        });
        $_This.css('z-index', ++_Index_);
    }

    $.fn.zIndex = function (new_Index) {
        if (! $.isData(new_Index))
            return  Get_zIndex.call(this[0]);
        else if (new_Index == '+')
            return  this.each(Set_zIndex);
        else
            return  this.css('z-index',  parseInt(new_Index) || 'auto');
    };

})(self, self.document, iQuery);



(function (BOM, DOM, $) {

    var W3C_Selection = (! ($.browser.msie < 10));

    function Select_Node(iSelection) {
        var iFocus = W3C_Selection ?
                iSelection.focusNode : iSelection.createRange().parentElement();
        var iActive = iFocus.ownerDocument.activeElement;

        return  $.contains(iActive, iFocus)  ?  iFocus  :  iActive;
    }

    function Find_Selection() {
        var iDOM = this.document || this.ownerDocument || this;

        if (iDOM.activeElement.tagName.toLowerCase() == 'iframe')  try {
            return  arguments.callee.call( iDOM.activeElement.contentWindow );
        } catch (iError) { }

        var iSelection = W3C_Selection ? iDOM.getSelection() : iDOM.selection;
        var iNode = Select_Node(iSelection);

        return  $.contains(
            (this instanceof Element)  ?  this  :  iDOM,  iNode
        ) && [
            iSelection, iNode
        ];
    }

    $.fn.selection = function (iContent) {
        if (iContent === undefined) {
            var iSelection = Find_Selection.call(this[0])[0];

            return  W3C_Selection ?
                iSelection.toString() : iSelection.createRange().htmlText;
        }

        return  this.each(function () {
            var iSelection = Find_Selection.call(this);
            var iNode = iSelection[1];

            iSelection = iSelection[0];
            iNode = (iNode.nodeType == 1)  ?  iNode  :  iNode.parentNode;

            if (! W3C_Selection) {
                iSelection = iSelection.createRange();

                return  iSelection.text = (
                    (typeof iContent == 'function')  ?
                        iContent.call(iNode, iSelection.text)  :  iContent
                );
            }
            var iProperty, iStart, iEnd;

            if ((iNode.tagName || '').match(/input|textarea/i)) {
                iProperty = 'value';
                iStart = Math.min(iNode.selectionStart, iNode.selectionEnd);
                iEnd = Math.max(iNode.selectionStart, iNode.selectionEnd);
            } else {
                iProperty = 'innerHTML';
                iStart = Math.min(iSelection.anchorOffset, iSelection.focusOffset);
                iEnd = Math.max(iSelection.anchorOffset, iSelection.focusOffset);
            }

            var iValue = iNode[iProperty];

            iNode[iProperty] = iValue.slice(0, iStart)  +  (
                (typeof iContent == 'function')  ?
                    iContent.call(iNode, iValue.slice(iStart, iEnd))  :  iContent
            )  +  iValue.slice(iEnd);
        });
    };

})(self, self.document, iQuery);



(function (BOM, DOM, $) {

/* ---------- Event from Pseudo ---------- */

    $.Event.prototype.isPseudo = function () {
        var $_This = $(this.currentTarget);

        var iOffset = $_This.offset();

        return Boolean(
            (this.pageX  &&  (
                (this.pageX < iOffset.left)  ||
                (this.pageX  >  (iOffset.left + $_This.width()))
            ))  ||
            (this.pageY  &&  (
                (this.pageY < iOffset.top)  ||
                (this.pageY  >  (iOffset.top + $_This.height()))
            ))
        );
    };

/* ---------- Focus AnyWhere ---------- */

    var DOM_Focus = $.fn.focus,
        iFocusable = [
            'a[href], area',
            'label, input, textarea, button, select, option',
            '*[tabIndex], *[contentEditable]'
        ].join(', ');

    $.fn.focus = function () {
        this.not(iFocusable).attr('tabIndex', -1).css('outline', 'none');

        return  DOM_Focus.apply(this, arguments);
    };

/* ---------- Single Finger Touch ---------- */

    function get_Touch(iEvent) {
        if (! iEvent.timeStamp)
            iEvent.timeStamp = $.now();

        if (! $.browser.mobile)  return iEvent;

        try {
            return iEvent.changedTouches[0];
        } catch (iError) {
            return iEvent.touches[0];
        }
    }

    var Touch_Data,  $_DOM = $(DOM);

    $_DOM.bind(
        $.browser.mobile ? 'touchstart MSPointerDown' : 'mousedown',
        function (iEvent) {
            var iTouch = get_Touch(iEvent);

            Touch_Data = {
                pX:      iTouch.pageX,
                pY:      iTouch.pageY,
                time:    iEvent.timeStamp
            };
        }
    ).bind(
        $.browser.mobile ? 'touchend touchcancel MSPointerUp' : 'mouseup',
        function (iEvent) {
            if (! Touch_Data)  return;

            var iTouch = get_Touch(iEvent);

            var swipeLeft = Touch_Data.pX - iTouch.pageX,
                swipeTop = Touch_Data.pY - iTouch.pageY,
                iDuring = iEvent.timeStamp - Touch_Data.time;

            var iShift = Math.sqrt(
                    Math.pow(swipeLeft, 2)  +  Math.pow(swipeTop, 2)
                ),
                _Event_;

            if (iDuring > 300)
                _Event_ = 'press';
            else if (iShift < 22)
                _Event_ = 'tap';
            else
                _Event_ = {
                    type:      'swipe',
                    deltaX:    swipeLeft,
                    deltaY:    swipeTop,
                    detail:    iShift
                };

            $(iEvent.target).trigger(_Event_);
        }
    );

/* ---------- Text Input Event ---------- */

    function TypeBack(iHandler, iKey, iEvent) {
        var $_This = $(this);
        var iValue = $_This[iKey]();

        if (false  !==  iHandler.call(iEvent.target, iEvent, iValue))
            return;

        iValue = iValue.split('');
        iValue.splice(
            BOM.getSelection().getRangeAt(0).startOffset - 1,  1
        );
        $_This[iKey]( iValue.join('') );
    }

    $.fn.input = function (iHandler) {
        this.filter('input, textarea').on(
            $.browser.modern ? 'input' : 'propertychange',
            function (iEvent) {
                if ($.browser.modern  ||  (iEvent.propertyName == 'value'))
                    TypeBack.call(this, iHandler, 'val', iEvent);
            }
        );

        this.not('input, textarea').on('paste',  function (iEvent) {

            return  iHandler.call(
                iEvent.target,
                iEvent,
                ($.browser.modern ? iEvent : BOM).clipboardData.getData(
                    $.browser.modern ? 'text/plain' : 'text'
                )
            );
        }).keyup(function (iEvent) {

            var iKey = iEvent.which;

            if (
                (iKey < 48)  ||  (iKey > 105)  ||
                ((iKey > 90)  &&  (iKey < 96))  ||
                iEvent.ctrlKey  ||  iEvent.shiftKey  ||  iEvent.altKey
            )
                return;

            TypeBack.call(iEvent.target, iHandler, 'text', iEvent);
        });

        return this;
    };

/* ---------- Cross Page Event ---------- */

    function CrossPageEvent(iType, iSource) {
        if (typeof iType == 'string') {
            this.type = iType;
            this.target = iSource;
        } else
            $.extend(this, iType);

        if (! (iSource && (iSource instanceof Element)))  return;

        $.extend(this,  $.map(iSource.dataset,  function (iValue) {
            if (typeof iValue == 'string')  try {
                return  $.parseJSON(iValue);
            } catch (iError) { }

            return iValue;
        }));
    }

    CrossPageEvent.prototype.valueOf = function () {
        var iValue = $.extend({ }, this);

        delete iValue.data;
        delete iValue.target;
        delete iValue.valueOf;

        return iValue;
    };

    var $_BOM = $(BOM);

    $.fn.onReply = function (iType, iData, iCallback) {
        var iTarget = this[0],  $_Source;

        if (typeof iTarget.postMessage != 'function')  return this;

        if (arguments.length == 4) {
            $_Source = $(iData);
            iData = iCallback;
            iCallback = arguments[3];
        }

        var _Event_ = new CrossPageEvent(iType,  ($_Source || { })[0]);

        if (typeof iCallback == 'function')
            $_BOM.on('message',  function (iEvent) {
                iEvent = iEvent.originalEvent || iEvent;

                var iReturn = new CrossPageEvent(
                        (typeof iEvent.data == 'string')  ?
                            $.parseJSON(iEvent.data) : iEvent.data
                    );
                if (
                    (iEvent.source === iTarget)  &&
                    (iReturn.type == iType)  &&
                    $.isEqual(iReturn, _Event_)
                ) {
                    iCallback.call($_Source ? $_Source[0] : this,  iReturn);
                    $_BOM.off('message', arguments.callee);
                }
            });
        iData = $.extend({data: iData},  _Event_.valueOf());

        iTarget.postMessage(
            ($.browser.msie < 10) ? JSON.stringify(iData) : iData,  '*'
        );
    };

/* ---------- Mouse Wheel Event ---------- */

    if (! $.browser.mozilla)  return;

    $_DOM.on('DOMMouseScroll',  function (iEvent) {
        $(iEvent.target).trigger({
            type:          'mousewheel',
            wheelDelta:    -iEvent.detail * 40
        });
    });

})(self, self.document, iQuery);



(function (BOM, DOM, $) {

    if (! ($.browser.msie < 11))  return;


    /* ----- Element Data Set ----- */

    function DOMStringMap(iElement) {
        for (var i = 0, iAttr;  i < iElement.attributes.length;  i++) {
            iAttr = iElement.attributes[i];
            if (iAttr.nodeName.slice(0, 5) == 'data-')
                this[ iAttr.nodeName.slice(5).toCamelCase() ] = iAttr.nodeValue;
        }
    }

    Object.defineProperty(Element.prototype, 'dataset', {
        get:    function () {
            return  new DOMStringMap(this);
        }
    });


    if (! ($.browser.msie < 10))  return;

    /* ----- Error Useful Information ----- */

    //  Thanks "Kevin Yang" ---
    //
    //      http://www.imkevinyang.com/2010/01/%E8%A7%A3%E6%9E%90ie%E4%B8%AD%E7%9A%84javascript-error%E5%AF%B9%E8%B1%A1.html

    Error.prototype.valueOf = function () {
        return  $.extend(this, {
            code:       this.number & 0x0FFFF,
            helpURL:    'https://msdn.microsoft.com/en-us/library/1dk3k160(VS.85).aspx'
        });
    };

    /* ----- DOM Class List ----- */

    function DOMTokenList() {
        var iClass = (arguments[0].getAttribute('class') || '').trim().split(/\s+/);

        $.extend(this, iClass);

        this.length = iClass.length;
    }

    DOMTokenList.prototype.contains = function (iClass) {
        if (iClass.match(/\s+/))
            throw  new DOMException([
                "Failed to execute 'contains' on 'DOMTokenList': The token provided (",
                iClass,
                ") contains HTML space characters, which are not valid in tokens."
            ].join("'"));

        return  (Array.prototype.indexOf.call(this, iClass) > -1);
    };

    Object.defineProperty(Element.prototype, 'classList', {
        get:    function () {
            return  new DOMTokenList(this);
        }
    });

    /* ----- History API ----- */

    var _BOM_,      $_BOM = $(BOM),
        _Pushing_,  _State_ = [[null, DOM.title, DOM.URL]];

    $(DOM).ready(function () {
        var iFrame = $('#_iQuery_SandBox_')[0];

        _BOM_ = iFrame.contentWindow;

        iFrame.onload = function () {
            if (_Pushing_) {
                _Pushing_ = false;
                return;
            }

            var iState = _State_[ _BOM_.location.search.slice(7) ];
            if (! iState)  return;

            BOM.history.state = iState[0];
            DOM.title = iState[1];

            $_BOM.trigger({
                type:     'popstate',
                state:    iState[0]
            });
        };
    });

    BOM.history.pushState = function (iState, iTitle, iURL) {
        for (var iKey in iState)
            if (! $.isData(iState[iKey]))
                throw ReferenceError("The History State can't be Complex Object !");

        if (typeof iTitle != 'string')
            throw TypeError("The History State needs a Title String !");

        _BOM_.document.title = DOM.title = iTitle;
        _Pushing_ = true;
        _BOM_.location.search = 'index=' + (_State_.push(arguments) - 1);
    };

    BOM.history.replaceState = function () {
        _State_ = [ ];
        this.pushState.apply(this, arguments);
    };

})(self, self.document, iQuery);



(function (BOM, DOM, $) {

    if (! (($.browser.msie < 10)  ||  $.browser.ios))
        return;

/* ---------- Form Element API ---------- */

    function Value_Check() {
        var $_This = $(this);

        if ((typeof $_This.attr('required') == 'string')  &&  (! this.value))
            return false;

        var iRegEx = $_This.attr('pattern');
        if (iRegEx)  try {
            return  RegExp(iRegEx).test(this.value);
        } catch (iError) { }

        if ((this.tagName.toLowerCase() == 'input')  &&  (this.type == 'number')) {
            var iNumber = Number(this.value),
                iMin = Number( $_This.attr('min') );
            if (
                isNaN(iNumber)  ||
                (iNumber < iMin)  ||
                (iNumber > Number( $_This.attr('max') ))  ||
                ((iNumber - iMin)  %  Number( $_This.attr('step') ))
            )
                return false;
        }

        return true;
    }

    HTMLInputElement.prototype.checkValidity = Value_Check;
    HTMLSelectElement.prototype.checkValidity = Value_Check;
    HTMLTextAreaElement.prototype.checkValidity = Value_Check;

    HTMLFormElement.prototype.checkValidity = function () {
        var $_Input = $('*[name]:input', this);

        for (var i = 0;  i < $_Input.length;  i++)
            if (! $_Input[i].checkValidity())
                return false;
        return true;
    };

/* ---------- Form Data Object ---------- */

    if (! ($.browser.msie < 10))  return;

    BOM.FormData = function () {
        this.ownerNode = arguments[0];
    };

    $.extend(BOM.FormData.prototype, {
        append:      function () {
            this[ arguments[0] ] = arguments[1];
        },
        toString:    function () {
            return $(this.ownerNode).serialize();
        }
    });

})(self, self.document, iQuery);



(function (BOM, DOM, $) {

    function HTTP_Request(iMethod, iURL, iData, iCallback) {
        if (typeof iData == 'function') {
            iCallback = iData;
            iData = null;
        }
        return  $.ajax({
            method:         iMethod,
            url:            iURL,
            data:           iData,
            complete:       iCallback,
            crossDomain:    true
        });
    }

    var HTTP_Method = $.makeSet('PUT', 'DELETE');

    for (var iMethod in HTTP_Method)
        $[ iMethod.toLowerCase() ] = $.proxy(HTTP_Request, BOM, iMethod);

})(self, self.document, iQuery);



(function (BOM, DOM, $) {

/* ---------- DOM HTTP Request ---------- */

    BOM.DOMHttpRequest = function () {
        this.status = 0;
        this.readyState = 0;
        this.responseType = 'text/plain';
    };
    BOM.DOMHttpRequest.JSONP = { };

    var Success_State = {
            readyState:    4,
            status:        200,
            statusText:    'OK'
        };

    $.extend(BOM.DOMHttpRequest.prototype, {
        open:                function () {
            this.responseURL = arguments[1];
            this.readyState = 1;
        },
        setRequestHeader:    function () {
            console.warn("JSONP/iframe doesn't support Changing HTTP Headers...");
        },
        send:                function (iData) {
            var iDHR = this,  _UUID_ = $.uuid('DHR');

            this.$_Transport =
                (iData instanceof BOM.FormData)  &&  $(iData.ownerNode);

            if (this.$_Transport && (
                iData.ownerNode.method.toUpperCase() == 'POST'
            )) {
                //  <iframe />
                var iTarget = this.$_Transport.submit(function () {
                        if ( $(this).data('_AJAX_Submitting_') )  return false;
                    }).attr('target');

                if ((! iTarget)  ||  iTarget.match(/^_(top|parent|self|blank)$/i)) {
                    this.$_Transport.attr('target', _UUID_);
                    iTarget = _UUID_;
                }

                $('iframe[name="' + iTarget + '"]').sandBox(function () {
                    iDHR.$_Transport.data('_AJAX_Submitting_', 0);
                    try {
                        iDHR.responseText = $(this).contents().find('body').text();
                    } catch (iError) { }

                    $.extend(iDHR, Success_State, {
                        responseType:    'text',
                        response:        iDHR.responseText
                    });
                    iDHR.onload();
                }).attr('name', iTarget);

                this.$_Transport.submit();
            } else {
                //  <script />, JSONP
                var iURL = this.responseURL.match(/([^\?=&]+\?|\?)?(\w.+)?/);

                if (! iURL)  throw 'Illegal JSONP URL !';

                this.constructor.JSONP[_UUID_] = function (iJSON) {
                    $.extend(iDHR, Success_State, {
                        responseType:    'json',
                        response:        iJSON,
                        responseText:    JSON.stringify(iJSON)
                    });
                    iDHR.onload();

                    delete this[_UUID_];
                    iDHR.$_Transport.remove();
                };
                this.responseURL = iURL[1] + $.param(
                    $.extend(arguments[0] || { },  $.paramJSON(
                        '?' + iURL[2].replace(
                            /(\w+)=\?/,  '$1=DOMHttpRequest.JSONP.' + _UUID_
                        )
                    ))
                );
                this.$_Transport = $('<script />',  {src: this.responseURL})
                    .appendTo(DOM.head);
            }

            this.readyState = 2;
        },
        abort:               function () {
            this.$_Transport = null;
            this.readyState = 0;
        }
    });

/* ---------- AJAX for IE 10- ---------- */

    $.ajaxTransport(function (iOption) {
        var iXHR;

        if (($.browser.msie < 10)  &&  iOption.crossDomain)
            return {
                send:     function (iHeader, iComplete) {
                    iXHR = new BOM.XDomainRequest();

                    iXHR.open(iOption.type, iOption.url, true);

                    iXHR.onload = function () {
                        iComplete(
                            200,
                            'OK',
                            {text:  iXHR.responseText},
                            'Content-Type: ' + iXHR.contentType
                        );
                    };
                    iXHR.send(iOption.data);
                },
                abort:    function () {
                    iXHR.abort();
                    iXHR = null;
                }
            };
    });

    function DHR_Transport(iOption) {
        var iXHR,  iForm = iOption.data.ownerNode;

        switch (true) {
            case (
                (iOption.data instanceof BOM.FormData)  &&
                $(iForm).is('form')  &&
                $('input[type="file"]', iForm)[0]
            ):
                break;
            case ($.fn.iquery  &&  (iOption.dataType == 'jsonp')):
                break;
            default:    return;
        }

        return {
            send:     function (iHeader, iComplete) {
                if (iOption.dataType == 'jsonp')
                    iOption.url += (iOption.url.split('?')[1] ? '&' : '?')  +
                        iOption.jsonp + '=?';

                iXHR = new BOM.DOMHttpRequest();
                iXHR.open(iOption.type, iOption.url);
                iXHR.onload = function () {
                    var iResponse = {text:  iXHR.responseText};
                    iResponse[ iXHR.responseType ] = iXHR.response;

                    iComplete(iXHR.status, iXHR.statusText, iResponse);
                };
                iXHR.send(iOption.data);
            },
            abort:    function () {
                iXHR.abort();
            }
        };
    }

    $.ajaxTransport(DHR_Transport);

    $.ajaxTransport('jsonp', DHR_Transport);

/* ---------- Form Element AJAX Submit ---------- */

    $.fn.ajaxSubmit = function (iCallback) {
        if (! this.length)  return this;

        function AJAX_Submit(iEvent) {
            var $_Form = $(this);

            if ((! this.checkValidity())  ||  $_Form.data('_AJAX_Submitting_'))
                return false;

            $_Form.data('_AJAX_Submitting_', 1);

            var iMethod = ($_Form.attr('method') || 'Get').toLowerCase();

            if (typeof $[iMethod] == 'function')
                $[iMethod](
                    this.action,
                    $.paramJSON('?' + $_Form.serialize()),
                    function () {
                        $_Form.data('_AJAX_Submitting_', 0);
                        iCallback.apply($_Form[0], arguments);
                    }
                );
            return false;
        }

        var $_Form = this.filter('form');

        if ( $_Form[0] )
            $_Form.submit(AJAX_Submit);
        else
            this.on('submit', 'form:visible', AJAX_Submit);

        return this;
    };

})(self, self.document, iQuery);



(function (BOM, DOM, $) {

    function Observer() {
        this.requireArgs = arguments[0] || 0;
        this.filter = arguments[1] || [ ];
        this.table = [[ ]];

        return this;
    }

    function Each_Row() {
        var _This_ = this,  iArgs = $.makeArray(arguments);

        if (typeof iArgs[iArgs.length - 1]  !=  'function')  return;

        var iCallback = iArgs.pop();

        $.each(this.table[0],  function (Index) {
            if (this == null)  return;

            for (var i = 0, _Condition_;  i < iArgs.length;  i++) {
                _Condition_ = _This_.table[i + 1][Index];

                if (_Condition_ === undefined) {

                    if (i < _This_.requireArgs)  return;

                } else if (
                    (_Condition_ != iArgs[i])  ||
                    (! iArgs[i].match(_Condition_))  ||  (
                        (typeof _This_.filter[i] == 'function')  &&
                        (false === _This_.filter[i].call(
                            _This_,  _Condition_,  iArgs[i]
                        ))
                    )
                )
                    return;
            }

            if (false  ===  iCallback.call(_This_, this))
                _This_.table[0][Index] = null;
        });
    }

    $.extend(Observer.prototype, {
        on:         function () {
            var iArgs = $.makeArray(arguments);

            if (typeof iArgs[iArgs.length - 1]  ==  'function') {
                var Index = this.table[0].push( iArgs.pop() )  -  1;

                for (var i = 0;  i < iArgs.length;  i++) {
                    if (! this.table[i + 1])
                        this.table[i + 1] = [ ];

                    this.table[i + 1][Index] = iArgs[i];
                }
            }
            return this;
        },
        off:        function () {
            var iArgs = $.makeArray(arguments);

            var iCallback = (typeof iArgs[iArgs.length - 1]  ==  'function')  &&
                    iArgs.pop();

            iArgs.push(function () {
                return  (iCallback !== false)  &&  (iCallback !== arguments[0]);
            });

            Each_Row.apply(this, iArgs);

            return this;
        },
        one:        function () {
            var iArgs = $.makeArray(arguments);

            if (typeof iArgs[iArgs.length - 1]  ==  'function') {
                var iCallback = iArgs.pop();

                iArgs.push(function () {
                    this.off.apply(this, iArgs);

                    return  iCallback.apply(this, arguments);
                });

                this.on.apply(this, iArgs);
            }

            return this;
        },
        trigger:    function () {
            var iArgs = $.makeArray(arguments),  iReturn;

            var iData = $.likeArray(iArgs[iArgs.length - 1])  &&  iArgs.pop();

            iArgs.push(function () {
                var _Return_ = arguments[0].apply(this, iData);

                iReturn = $.isData(_Return_) ? _Return_ : iReturn;
            });

            Each_Row.apply(this, iArgs);

            return iReturn;
        }
    });

    $.Observer = Observer;

})(self, self.document, iQuery);


//
//              >>>  jQuery+  <<<
//
//
//    [Version]    v7.1  (2016-05-25)
//
//    [Require]    jQuery  v1.9+
//
//
//        (C)2014-2016  shiy2008@gmail.com
//



(function (BOM, DOM, $) {

    return  BOM.jQuery.extend(true, $);

})(self, self.document, iQuery);


});
