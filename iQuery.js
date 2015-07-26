//
//                >>>  iQuery.js  <<<
//
//
//      [Version]    v1.0  (2015-7-26)  Stable
//
//      [Usage]      A Light-weight jQuery Compatible API
//                   with IE 8+ compatibility.
//
//
//            (C)2015    shiy2008@gmail.com
//


/* ---------- ECMAScript 5/6  Patch ---------- */
(function (BOM) {

    if (! console) {
        function _Notice_() {
            var iString = [ ];

            for (var i = 0;  i < arguments;  i++)
                iString.push( arguments[i].toString() );

            BOM.status = iString.join(' ');
        }
        BOM.console = {
            log:      _Notice_,
            info:     _Notice_,
            warn:     _Notice_,
            error:    _Notice_
        };
    }

    BOM.iRegExp = function (iString, Mode, Special_Char) {
        var iRegExp_Compiled = / /,
            iChar = ['/', '.'];

        if (Special_Char instanceof Array)
            iChar = iChar.concat(Special_Char);
        else if (Special_Char === null)
            iChar.length = 0;

        for (var i = 0; i < iChar.length; i++)
            iString = iString.replace(
                RegExp("([^\\\\])\\" + iChar[i], 'g'),  "$1\\" + iChar[i]
            );
        iRegExp_Compiled.compile(iString, Mode);

        return iRegExp_Compiled;
    };

    if (! ''.trim)
        var Blank_Char = BOM.iRegExp('(^\\s*)|(\\s*$)', 'g');
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

    if (! [ ].indexOf)
        Array.prototype.indexOf = function () {
            for (var i = 0;  i < this.length;  i++)
                if (arguments[0] === this[i])
                    return i;

            return -1;
        };

    if (! Date.now)
        Date.now = function () {
            return  (new Date()).getTime();
        };

//  JSON Extension  v0.4

    BOM.JSON.format = function () {
        return  this.stringify(arguments[0], null, 4)
            .replace(/(\s+"[^"]+":) ([^\s]+)/g, '$1    $2');
    };

    BOM.JSON.parseAll = function (iJSON) {
        return  this.parse(iJSON,  function (iKey, iValue) {
                if (iKey && (typeof iValue == 'string'))  try {
                    return  BOM.JSON.parse(iValue);
                } catch (iError) { }

                return iValue;
            });
    };

//  New Window Fix  v0.3

    BOM.new_Window_Fix = function (Fix_More) {
        if (! this)  return false;

        try {
            var _Window_ = this.opener,
                This_DOM = this.document;

            if (_Window_ && (this.location.href == 'about:blank'))
                This_DOM.domain = _Window_.document.domain;

            if (! (_Window_ || this).$.browser.modern)
                This_DOM.head = This_DOM.documentElement.firstChild;
        } catch (iError) {
            return false;
        }
        if (Fix_More)
            Fix_More.call(this);

        return true;
    };

    BOM.new_Window_Fix();

})(self);


// ---------->  iQuery.js  <---------- //
(function (BOM, DOM) {

/* ---------- UA Check ---------- */
    var UA = navigator.userAgent;

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

    var is_iOS = UA.match(/(iTouch|iPhone|iPad|iWatch);[^\)]+CPU[^\)]+OS (\d+_\d+)_/i),
        is_Android = UA.match(/(Android |Silk\/)(\d+\.\d+)/i);

    var _Browser_ = {
            msie:             IE_Ver,
            ff:               FF_Ver,
            webkit:           WK_Ver,
            modern:           !  (IE_Ver < 9),
            mobile:           !! is_Mobile,
            pad:              !! is_Pad,
            phone:            !! is_Phone,
            ios:              is_iOS  ?  parseFloat( is_iOS[2].replace('_', '.') )  :  NaN,
            android:          is_Android ? parseFloat(is_Android[2]) : NaN,
            versionNumber:    IE_Ver || FF_Ver || WK_Ver
        };


/* ---------- Object Base ---------- */
    function _Each_(Arr_Obj, iEvery) {
        if (! Arr_Obj)  return;

        if (typeof Arr_Obj.length == 'number') {
            for (var i = 0;  i < Arr_Obj.length;  i++)
                if (iEvery.call(Arr_Obj[i], i, Arr_Obj[i]) === false)
                    break;
        } else  for (var iKey in Arr_Obj)
            if (iEvery.call(Arr_Obj[iKey], iKey, Arr_Obj[iKey]) === false)
                break;

        return Arr_Obj;
    }

    function _Extend_(iTarget) {
        iTarget = iTarget || (
            (arguments[1] instanceof Array)  ?  [ ]  :  { }
        );

        for (var i = 1;  i < arguments.length;  i++)
            for (var iKey in arguments[i])
                if (
                    Object.prototype.hasOwnProperty.call(arguments[i], iKey)  &&
                    (arguments[i][iKey] !== undefined)
                )
                    iTarget[iKey] = arguments[i][iKey];

        return iTarget;
    }

    function _inKey_() {
        var iObject = { };

        for (var i = 0;  i < arguments.length;  i++)
            iObject[arguments[i]] = true;

        return iObject;
    }

    var Type_Info = {
            Data:         _inKey_('String', 'Number', 'Boolean', 'Object', 'Null'),
            BOM:          _inKey_('Window', 'DOMWindow', 'global'),
            DOM:          {
                set:        _inKey_('Array', 'HTMLCollection', 'NodeList', 'jQuery', 'iQuery'),
                element:    _inKey_('Window', 'Document', 'Element'),
                root:       _inKey_('Document', 'Window')
            },
            DOM_Event:    _inKey_(
                'load', 'abort', 'error',
                'keydown', 'keypress', 'keyup',
                'mousedown', 'mouseup', 'mousemove',
                'mouseover', 'mouseout', 'mouseenter', 'mouseleave',
                'click', 'dblclick', 'scroll', 'mousewheel',
                'select', 'focus', 'blur', 'change', 'submit', 'reset',
                'DOMContentLoaded',
                'DOMAttrModified', 'DOMAttributeNameChanged',
                'DOMCharacterDataModified',
                'DOMElementNameChanged',
                'DOMNodeInserted', 'DOMNodeInsertedIntoDocument',
                'DOMNodeRemoved',  'DOMNodeRemovedFromDocument',
                'DOMSubtreeModified'
            ),
            Target:       _inKey_('_top', '_parent', '_self', '_blank')
        };

    function _Type_(iVar) {
        var iType = typeof iVar;

        iType = (iType == 'object') ? (
                (iVar && iVar.constructor.name) ||
                Object.prototype.toString.call(iVar).match(/\[object\s+([^\]]+)\]/i)[1]
            ) : (
                iType[0].toUpperCase() + iType.slice(1)
            );

        if (! iVar) {
            if (isNaN(iVar)  &&  (iVar !== iVar))
                return 'NaN';
            return iType;
        }

        if (
            Type_Info.BOM[iType] ||
            ((iVar == iVar.document) && (iVar.document != iVar))
        )
            return 'Window';

        if (iVar.defaultView || iVar.documentElement)
            return 'Document';

        if (
            iType.match(/HTML\w+?Element$/) ||
            (typeof iVar.tagName == 'string')
        )
            return 'Element';

        if (
            (_Browser_.msie < 9) &&
            (iType == 'Object') &&
            (typeof iVar.length == 'number')
        )  try {
            iVar.item();
            try {
                iVar.namedItem();
                return 'HTMLCollection';
            } catch (iError) {
                return 'NodeList';
            }
        } catch (iError) { }

        return iType;
    }

    function Back_Track(iName, iCallback) {
        var iResult = [ ];

        for (var _This_ = this, _Next_, i = 0;  _This_[iName];  _This_ = _Next_, i++) {
            _Next_ = _This_[iName];
            iResult.push(_Next_);
            if ( iCallback )
                iCallback.call(_Next_, i, _Next_);
        }

        return iResult;
    }


/* ---------- DOM Info Operator - Get first, Set all. ---------- */
    var _Get_Set_ = {
            Get_Name_Type:    _inKey_('String', 'Array')
        };

    function _Operator_(iType, iElement, iName, iValue) {
        if ((! iName) || (iValue === null)) {
            if (_Get_Set_[iType].clear)
                for (var i = 0;  i < iElement.length;  i++)
                    _Get_Set_[iType].clear(iElement[i], iName);
            return iElement;
        }
        if ((iValue === undefined) && (_Type_(iName) in _Get_Set_.Get_Name_Type)) {
            if (! iElement.length)
                return;
            else if (typeof iName == 'string')
                return  _Get_Set_[iType].get(iElement[0], iName);
            else {
                var iData = { };
                for (var i = 0;  i < iName.length;  i++)
                    iData[iName[i]] = _Get_Set_[iType].get(iElement[0], iName[i]);
                return iData;
            }
        } else {
            var iResult;

            if (typeof iName == 'string') {
                if (typeof iValue == 'function') {
                    for (var i = 0;  i < iElement.length;  i++)
                        iResult = _Get_Set_[iType].set(iElement[i], iName, iValue.call(
                            iElement[i],  i,  _Get_Set_[iType].get(iElement[i], iName)
                        ));
                    return  iResult || iElement;
                } else {
                    iResult = { };
                    iResult[iName] = iValue;
                    iName = iResult;
                    iResult = undefined;
                }
            }
            for (var i = 0;  i < iElement.length;  i++)
                for (var iKey in iName)
                    iResult = _Get_Set_[iType].set(iElement[i], iKey, iName[iKey]);

            return  iResult || iElement;
        }
    }

    /* ----- DOM innerText ----- */
    _Get_Set_.innerText = {
        set:    function (iElement, iText) {
            switch ( iElement.tagName.toLowerCase() ) {
                case 'style':     if (! _Browser_.modern) {
                    iElement.styleSheet.cssText = iText;
                    return;
                }
                case 'script':    if (! _Browser_.modern) {
                    iElement.text = iText;
                    return;
                }
                default:          iElement.appendChild( DOM.createTextNode(iText) );
            }
            iElement[_Browser_.ff ? 'textContent' : 'innerText'] = iText;
        },
        get:    _Browser_.ff ?
            function (iElement) {
                var TextRange = iElement.ownerDocument.createRange();
                TextRange.selectNodeContents(iElement);
                return TextRange.toString();
            } :
            function (iElement) {
                return iElement.innerText;
            }
    };

    /* ----- DOM Style ----- */
    var IE_CSS_Filter = (! _Browser_.modern),
        Code_Indent = (_Browser_.modern  ?  ''  :  ' '.repeat(4));

    function toHexInt(iDec, iLength) {
        var iHex = parseInt( Number(iDec).toFixed(0) ).toString(16);

        if (iLength && (iLength > iHex.length))
            iHex = '0'.repeat(iLength - iHex.length) + iHex;

        return iHex;
    }

    function RGB_Hex(iRed, iGreen, iBlue) {
        var iArgs = _Extend_([ ], arguments);

        if ((iArgs.length == 1) && (typeof iArgs[0] == 'string'))
            iArgs = iArgs[0].replace(/rgb\(([^\)]+)\)/i, '$1').replace(/,\s*/g, ',').split(',');

        for (var i = 0; i < 3; i++)
            iArgs[i] = toHexInt(iArgs[i], 2);
        return iArgs.join('');
    }

    _Get_Set_.Style = {
        PX_Needed:    _inKey_(
            'width',  'min-width',  'max-width',
            'height', 'min-height', 'max-height',
            'margin', 'padding',
            'top',    'left',
            'border-radius'
        ),
        get:          function (iElement, iName) {
            if ((! iElement) || (_Type_(iElement) in Type_Info.DOM.root))
                return null;

            var iScale = 1;

            if (IE_CSS_Filter)
                switch (iName) {
                    case 'opacity':    {
                        iName = 'filter';
                        iScale = 100;
                    }
                }

            var iStyle = IE_CSS_Filter ?
                    iElement.currentStyle.getAttribute(iName) :
                    DOM.defaultView.getComputedStyle(iElement, null).getPropertyValue(iName);

            if ((_Type_(iStyle) == 'Number') || (! iStyle))
                return iStyle;

            var iNumber = parseFloat(iStyle);

            return  isNaN(iNumber) ? iStyle : (iNumber / iScale);
        },
        set:          function (iElement, iName, iValue) {
            if (_Type_(iElement) in Type_Info.DOM.root)  return false;

            if (IE_CSS_Filter) {
                var iString = '',  iWrapper,  iScale = 1,  iConvert;
                if (typeof iValue == 'string')
                    var iRGBA = iValue.match(/\s*rgba\(([^\)]+),\s*(\d\.\d+)\)/i);

                if (iName == 'opacity') {
                    iName = 'filter';
                    iWrapper = 'progid:DXImageTransform.Microsoft.Alpha(opacity={n})';
                    iScale = 100;
                } else if (!! iRGBA) {
                    iString = iValue.replace(iRGBA[0], '');
                    if (iString)
                        iString += arguments.callee(arguments[0], iName, iString);
                    if (iName != 'background')
                        iString += arguments.callee(
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
            }

            if ((! isNaN( Number(iValue) ))  &&  this.PX_Needed[iName])
                iValue += 'px';
            if (iWrapper)
                iValue = iWrapper.replace(/\{n\}/g,  iConvert ?
                      iConvert(iRGBA[2], iRGBA[1]) :
                      (iValue * iScale)
                );

            if (iElement)
                iElement.style[
                    IE_CSS_Filter ? 'setAttribute' : 'setProperty'
                ](
                    iName,
                    (_Browser_.msie != 9) ? iValue : iValue.toString(),
                    'important'
                );
            else  return [
                    iString ? (iString + ";\n") : ''
                ].concat([
                    iName,  ':',  Code_Indent,  iValue
                ]).join('');
        }
    };

    /* ----- DOM Attribute ----- */
    _Get_Set_.Attribute = {
        alias:    {
            'class':    'className',
            'for':      'htmlFor'
        },
        get:      function (iElement, iName) {
            return  (_Type_(iElement) in Type_Info.DOM.root) ?
                    null : iElement.getAttribute(
                        _Browser_.modern  ?  iName  :  (this.alias[iName] || iName)
                    );
        },
        set:      function (iElement, iName, iValue) {
            if (_Type_(iElement) in Type_Info.DOM.root)
                return false;

            if ((! _Browser_.modern) && this.alias[iName])
                iElement[ this.alias[iName] ] = iValue;
            else
                iElement.setAttribute(iName, iValue);
        },
        clear:    function (iElement, iName) {
            iElement.removeAttribute(
                _Browser_.modern  ?  iName  :  (this.alias[iName] || iName)
            );
        }
    };

    /* ----- DOM Property ----- */
    _Get_Set_.Property = {
        alias:    _Get_Set_.Attribute.alias,
        get:      function (iElement, iName) {
            return  iElement[
                    _Browser_.modern  ?  iName  :  (this.alias[iName] || iName)
                ];
        },
        set:      function (iElement, iName, iValue) {
            iElement[this.alias[iName] || iName] = iValue;
        }
    };

    /* ----- DOM Data ----- */
    _Get_Set_.Data = {
        _Data_:    [ ],
        set:       function (iElement, iName, iValue) {
            if (_Type_(iElement.dataIndex) != 'Number')
                iElement.dataIndex = this._Data_.push({ }) - 1;

            this._Data_[iElement.dataIndex][iName] = iValue;
        },
        get:       function (iElement, iName) {
            if (_Type_(iElement.dataIndex) != 'Number')
                iElement.dataIndex = this._Data_.push({ }) - 1;

            var iData = (this._Data_[iElement.dataIndex] || { })[iName];

            if (iData)
                return iData;
            else  try {
                return  _Operator_('Attribute', [iElement],  'data-' + iName);
            } catch (iError) {
                return null;
            }
        },
        clear:     function (iElement, iName) {
            if (typeof iElement.dataIndex != 'number')  return;

            if (iName)
                this._Data_[iElement.dataIndex][iName] = null;
            else
                this._Data_[iElement.dataIndex] = null;
        },
        clone:     function (iOld, iNew) {
            iNew.dataIndex = this._Data_.push({ }) - 1;
            _Extend_(this._Data_[iNew.dataIndex], this._Data_[iOld.dataIndex]);
        }
    };

    /* ----- DOM Offset ----- */
    function DOM_Offset() {
        var iOffset = {
                left:    this[0].offsetLeft,
                top:     this[0].offsetTop
            };

        Back_Track.call('offsetParent', function () {
            iOffset.left += this.offsetLeft;
            iOffset.top += this.offsetTop;
        });

        return iOffset;
    }


/* ---------- DOM Event ---------- */
    _Operator_('Data',  [BOM],  '_timer_',  { });

    var _Time_ = {
            _Root_:     BOM,
            now:        Date.now,
            every:      function (iSecond, iCallback) {
                var _BOM_ = this._Root_,
                    iTimeOut = (iSecond || 1) * 1000,
                    iTimer, iReturn, Index = 0,
                    iStart = this.now(), iDuring;

                iTimer = _BOM_.setTimeout(function () {
                    iDuring = (Date.now() - iStart) / 1000;
                    iReturn = iCallback.call(_BOM_, ++Index, iDuring);
                    if ((typeof iReturn == 'undefined') || iReturn)
                        _BOM_.setTimeout(arguments.callee, iTimeOut);
                }, iTimeOut);

                return iTimer;
            },
            wait:       function (iSecond, iCallback) {
                return  this.every(iSecond, function () {
                    iCallback.apply(this, arguments);
                    return false;
                });
            },
            start:      function (iName) {
                var _This_ = this,  Time_Stamp;

                _Operator_('Data', [BOM], '_timer_',  function (_Index_, iTimer) {
                    Time_Stamp = iTimer[iName] = _This_.now();
                    return iTimer;
                });

                return Time_Stamp;
            },
            end:        function () {
                var iTimer = _Operator_('Data', [BOM], '_timer_');
                return  (this.now() - iTimer[arguments[0]]) / 1000;
            },
            guid:       function () {
                return  [
                        (arguments[0] || 'guid'),  '_',
                        this.now().toString(16),
                        Math.random().toString(16).slice(2)
                    ].join('');
            }
        };

    /* ----- Event Proxy Layer ----- */
    function Event_Trigger(iType, iName, iData) {
        _Operator_('Data', this, '_trigger_', iData);

        for (var i = 0, iEvent;  i < this.length;  i++) {
            iEvent = DOM.createEvent(iType);
            iEvent[
                'init' + (
                    (iType == 'HTMLEvents') ? 'Event' : iType
                )
            ](iName, true, true, 0);
            this[i].dispatchEvent(iEvent);
        }

        return this;
    }

    function Proxy_Handler(iEvent) {
        var iHandler = _Operator_('Data', [this], '_event_')[iEvent.type],
            iReturn,
            Trigger_Data = _Operator_('Data', [this], '_trigger_');

        for (var i = 0, _Return_;  i < iHandler.length;  i++) {
            _Return_ = iHandler[i].apply(
                this,  _Extend_([ ], arguments).concat(Trigger_Data)
            );
            if (iReturn !== false)  iReturn = _Return_;
        }
        _Operator_('Data', [this], '_trigger_', null);

        if (iReturn === false) {
            iEvent.preventDefault();
            iEvent.stopPropagation();
        }
    }

/* ---------- DOM Traversal ---------- */
    function _Parents_() {
        var _GUID_ = _Time_.guid('parent');

        for (var i = 0;  i < this.length;  i++)
            Back_Track.call(this[i],  'parentNode',  function () {
                _Operator_('Attribute',  [this],  _GUID_,  function (_Index_, iTimes) {
                    return  iTimes ? (parseInt(iTimes) + 1) : 1
                });
            });

        return _GUID_;
    }


/* ---------- DOM Constructor ---------- */
    function DOM_Create(TagName, AttrList) {
        var iNew,
            iTag = TagName.match(/<\s*\w+[^>]*>/g),
            IE_Scope = TagName.match(
                /^[^<]*<\s*(head|meta|title|link|style|script|noscript|(!--[^>]*--))[^>]*>/i
            );
        IE_Scope = (! _Browser_.modern) && IE_Scope;

        if (iTag.length > 1) {
            iNew = DOM.createElement('div');
            iNew.innerHTML = (IE_Scope ? 'IE_Scope' : '') + TagName;

            iNew = _Extend_([ ],  iNew.childNodes);
            if (! iNew.length)  return iNew;

            if (IE_Scope)
                iNew[0].nodeValue = iNew[0].nodeValue.slice(8);

            if ((iNew.length > 1)  ||  (iNew[0].nodeType != 1))
                return iNew;
        } else
            iNew = [DOM.createElement(
                TagName.match(/<\s*(\w+)[^>]*>/)[1]
            )];

        if (AttrList)  for (var AK in AttrList) {
            var iValue = AttrList[AK];
            try {
                switch (AK) {
                    case 'text':     _Get_Set_.innerText.set(iNew[0], iValue);  break;
                    case 'html':     iNew[0].innerHTML = iValue;                break;
                    case 'style':    if (_Type_(iValue) == 'Object') {
                        _Operator_('Style', iNew, iValue);
                        break;
                    }
                    default:         _Operator_('Attribute', iNew, AK, iValue);
                }
            } catch (iError) {
                console.error(iError);
            }
        }

        return iNew;
    }


/* ---------- DOM Selector ---------- */
    var iPseudo = {
            ':visible':    {
                feature:    {
                    display:    'none',
                    width:      0,
                    height:     0
                },
                filter:     function (iElement) {
                    var iStyle = _Operator_('Style', [iElement], [
                            'display', 'width', 'height'
                        ]);

                    for (var iKey in iStyle)
                        if (iStyle[iKey] === this.feature[iKey])
                            return false;
                    return true;
                }
            },
            ':button':     {
                feature:    _inKey_('button', 'image', 'submit', 'reset'),
                filter:     function (iElement) {
                    var iTag = iElement.tagName.toLowerCase();

                    if ((iTag == 'button') || (
                        (iTag == 'input') &&
                        (iElement.type.toLowerCase() in this.feature)
                    ))
                        return true;
                    else
                        return false;
                }
            },
            ':header':     {
                filter:    function () {
                    return  (arguments[0] instanceof HTMLHeadingElement);
                }
            },
            ':input':      {
                feature:    _inKey_('input', 'textarea', 'button', 'select'),
                filter:     function () {
                    return  (arguments[0].tagName.toLowerCase() in this.feature);
                }
            }
        };

    iPseudo[':hidden'] = {
        filter:    function () {
            return  (! iPseudo[':visible'].filter(arguments[0]));
        }
    };

    for (var _Pseudo_ in iPseudo)
        iPseudo[_Pseudo_].regexp = BOM.iRegExp(
            '(.*?)' + _Pseudo_ + "([>\\+~\\s]*.*)",  undefined,  null
        );

    var _Concat_ = Array.prototype.concat;

    function DOM_Search(iRoot, iSelector) {
        var _Self_ = arguments.callee,  iSet = [ ];

        _Each_(iSelector.split(/\s*,\s*/),  function () {
            try {
                iSet = _Concat_.apply(iSet,  iRoot.querySelectorAll(arguments[1] || '*'));
            } catch (iError) {
                var _Selector_;
                for (var _Pseudo_ in iPseudo) {
                    _Selector_ = arguments[1].match(iPseudo[_Pseudo_].regexp);
                    if (_Selector_ && (_Selector_.length > 1))
                        break;
                }
                var Set_0 = _Self_(
                        iRoot,  _Selector_[1] + (_Selector_[1].match(/[>\+~]\s*$/) ? '*' : '')
                    ),
                    Set_1 = [ ];
                for (var i = 0;  i < Set_0.length;  i++)
                    if ( iPseudo[_Pseudo_].filter(Set_0[i]) ) {
                        if (_Selector_[2])
                            Set_1 = Set_1.concat(
                                _Self_(Set_0[i],  '*' + _Selector_[2])
                            );
                        else
                            Set_1.push(Set_0[i]);
                    }
                for (var i = Set_1.length - 1;  i > 0;  i--)
                    if (Set_1.indexOf(Set_1[i]) < i)
                        Set_1[i] = null;

                iSet = iSet.concat(Set_1);
            }
        });

        return iSet;
    }


/* ---------- XML Module ---------- */
    if (_Browser_.msie < 9)
        var IE_DOMParser = (function (MS_Version) {
                for (var i = 0; i < MS_Version.length; i++)  try {
                    new ActiveXObject( MS_Version[i] );
                    return MS_Version[i];
                } catch (iError) { }
            })([
                'MSXML2.DOMDocument.6.0',
                'MSXML2.DOMDocument.5.0',
                'MSXML2.DOMDocument.4.0',
                'MSXML2.DOMDocument.3.0',
                'MSXML2.DOMDocument',
                'Microsoft.XMLDOM'
            ]);

    function XML_Parse(iString) {
        iString = iString.trim();
        if ((iString[0] != '<') || (iString[iString.length - 1] != '>'))
            throw 'Illegal XML Format...';

        var iXML;

        if (DOMParser) {
            iXML = (new DOMParser()).parseFromString(iString, 'text/xml');
            var iError = iXML.getElementsByTagName('parsererror');
            if (iError.length) {
                throw  new SyntaxError(1, 'Incorrect XML Syntax !');
                console.log(iError[0]);
            }
            iXML.cookie;    //  for old WebKit core to throw Error
        } else {
            iXML = new ActiveXObject( IE_DOMParser );
            iXML.async = false;
            iXML.loadXML(iString);
            if (iXML.parseError.errorCode) {
                throw  new SyntaxError(iXML.parseError, 'Incorrect XML Syntax !');
                console.log(iXML.parseError.reason);
            }
        }
        return iXML;
    }


/* ---------- jQuery API ---------- */
    BOM.iQuery = function () {
        /* ----- Global Wrapper ----- */
        var _Self_ = arguments.callee;
        var iArgs = _Extend_([ ], arguments);

        if (! (this instanceof _Self_))
            return  new _Self_(iArgs[0], iArgs[1]);
        if (iArgs[0] instanceof _Self_)
            return  iArgs[0];

        /* ----- Constructor ----- */
        this.length = 0;

        if (! iArgs[0]) return;

        if (typeof iArgs[0] == 'string') {
            if (iArgs[0][0] != '<') {
                this.context = iArgs[1] || DOM;
                try {
                    this.add( DOM_Search(this.context, iArgs[0]) );
                } catch (iError) { }
                this.selector = iArgs[0];
            } else
                this.add(DOM_Create(
                    iArgs[0],  (_Type_(iArgs[1]) == 'Object') && iArgs[1]
                ));
        } else
            this.add( iArgs[0] );
    };

    var $ = BOM.iQuery;
    $.fn = $.prototype;

    if (typeof BOM.jQuery != 'function') {
        BOM.jQuery = BOM.iQuery;
        BOM.$ = $;
    }

    /* ----- iQuery Static Method ----- */
    _Extend_($, {
        browser:          _Browser_,
        type:             _Type_,
        isPlainObject:    function (iValue) {
            return  iValue && (iValue.constructor === Object);
        },
        isEmptyObject:    function () {
            for (var iKey in arguments[0])
                return false;
            return true;
        },
        isData:           function () {
            return  (this.type(arguments[0]) in Type_Info.Data);
        },
        each:             _Each_,
        extend:           _Extend_,
        makeArray:        function () {
            return  this.extend([ ], arguments[0]);
        },
        inArray:          function () {
            return  Array.prototype.indexOf.call(arguments[0], arguments[1]);
        },
        contains:         function (iParent, iChild) {
            if (! iChild)  return false;

            if ($.browser.modern)
                return  !!(iParent.compareDocumentPosition(iChild) & 16);
            else
                return  (iParent !== iChild) && iParent.contains(iChild);
        },
        trim:             function () {
            return  arguments[0].trim();
        },
        parseJSON:        BOM.JSON.parse,
        parseXML:         XML_Parse,
        param:            function (iObject) {
            var iParameter = [ ],  iValue;

            if ( $.isPlainObject(iObject) )
                for (var iName in iObject) {
                    iValue = iObject[iName];

                    if ( $.isPlainObject(iValue) )
                        iValue = BOM.JSON.stringify(iValue);
                    else if (! $.isData(iValue))
                        continue;

                    iParameter.push(iName + '=' + iValue);
                }
            else if (iObject instanceof $)
                for (var i = 0;  i < iObject.length;  i++)
                    iParameter.push(iObject[i].name + '=' + iObject[i].value);

            return iParameter.join('&');
        },
        paramJSON:        function (Args_Str) {
            Args_Str = (Args_Str || BOM.location.search).match(/[^\?&\s]+/g);
            if (! Args_Str)  return { };

            var _Args_ = {
                    toString:    function () {
                        return  BOM.JSON.format(this);
                    }
                };

            for (var i = 0, iValue; i < Args_Str.length; i++) {
                Args_Str[i] = Args_Str[i].split('=');

                iValue = BOM.decodeURIComponent(
                    Args_Str[i].slice(1).join('=')
                );
                try {
                    iValue = BOM.JSON.parse(iValue);
                } catch (iError) { }

                _Args_[ Args_Str[i][0] ] = iValue;
            }

            return  Args_Str.length ? _Args_ : { };
        },
        fileName:         function File_Name() {
            return  (arguments[0] || BOM.location.pathname)
                    .split('?')[0].split('/').slice(-1)[0];
        },
        data:             function (iElement, iName, iValue) {
            return  _Operator_('Data', [iElement], iName, iValue);
        }
    });

    _Extend_($, _Time_);

    /* ----- iQuery Instance Method ----- */
    _Extend_($.fn, {
        splice:             Array.prototype.splice,
        add:                function () {
            var iArgs = $.makeArray(arguments);
            var iArgType = $.type(iArgs[0]);

            if (iArgType == 'String') {
                iArgs[0] = $(iArgs[0], iArgs[1]);
                iArgType = 'iQuery';
            } else if (
                ($.type(iArgs[0].length) == 'Number') &&
                (! (iArgType in Type_Info.DOM.element))
            )
                iArgType = 'Array';

            if (iArgType in Type_Info.DOM.set) {
                for (var i = 0;  i < iArgs[0].length;  i++)
                    if ( iArgs[0][i] )
                        Array.prototype.push.call(this, iArgs[0][i]);
            } else if (iArgType in Type_Info.DOM.element) {
                Array.prototype.push.call(this, iArgs[0]);
                this.context = iArgs[0].ownerDocument;
            }

            return this;
        },
        jquery:             '1.9.1',
        iquery:             '1.0',
        eq:                 function () {
            return  $.extend(
                    $( this[arguments[0]] ),
                    {prevObject:  this}
                );
        },
        index:              function (iTarget) {
            if (! iTarget)
                return
                    Back_Track.call(
                        this[0],
                        ($.browser.msie < 9) ? 'prevSibling' : 'prevElementSibling'
                    ).length;

            var iType = $.type(iTarget);
            switch (true) {
                case (iType == 'String'):
                    return  $.inArray($(iTarget), this[0]);
                case (iType in Type_Info.DOM.set):    {
                    iTarget = iTarget[0];
                    iType = $.type(iTarget);
                }
                case (iType in Type_Info.DOM.element):
                    return  $.inArray(this, iTarget);
            }
            return -1;
        },
        slice:              function () {
            return  $.extend(
                    $( [ ].slice.apply(this, arguments) ),
                    {prevObject:  this}
                );
        },
        each:               function () {
            $.each(this, arguments[0]);

            return this;
        },
        is:                 function (iSelector) {
            return  (
                    $.inArray(
                        $(iSelector,  this[0] && this[0].parentNode),
                        this[0]
                    ) > -1
                );
        },
        filter:             function (iSelector) {
            var $_Filter = $(iSelector),
                $_Result = [ ];

            if ( $_Filter.length ) {
                for (var i = 0;  i < this.length;  i++)
                    if ($.inArray($_Filter, this[i]) > -1)
                        $_Result.push( this[i] );
            }

            return  $.extend($($_Result), {prevObject:  this});
        },
        not:                function () {
            var $_Not = $(arguments[0]),
                $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                if ($.inArray($_Not, this[i]) < 0)
                    $_Result.push(this[i]);

            return  $.extend($($_Result), {prevObject:  this});
        },
        attr:               function () {
            return  _Operator_('Attribute', this, arguments[0], arguments[1]);
        },
        removeAttr:         function (iAttr) {
            iAttr = iAttr.trim().split(/\s+/);

            for (var i = 0;  i < iAttr.length;  i++)
                this.attr(iAttr[i], null);

            return this;
        },
        prop:               function () {
            return  _Operator_('Property', this, arguments[0], arguments[1]);
        },
        data:               function () {
            return  _Operator_('Data', this, arguments[0], arguments[1]);
        },
        addBack:            function () {
            var _GUID_ = $.guid();

            var $_Result = $(
                    _Concat_.apply($.makeArray(this), this.prevObject)
                ).attr('iquery', _GUID_);

            return  $.extend(
                    $('*[iquery="' + _GUID_ + '"]').removeAttr('iquery'),
                    {prevObject:  this}
                );
        },
        parent:             function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                if ($.inArray($_Result, this[i].parentNode) == -1)
                    $_Result.push( this[i].parentNode );

            $_Result = $($_Result);
            if ( arguments[0] )
                $_Result = $_Result.filter(arguments[0]);

            return  $.extend($_Result, {prevObject:  this});
        },
        parents:            function () {
            var _GUID_ = _Parents_.call(this);
            var $_Result = $('*[' + _GUID_ + ']').removeAttr(_GUID_);
            if ( arguments[0] )
                $_Result = $_Result.filter(arguments[0]);

            return  $.extend(
                    Array.prototype.reverse.call($_Result),
                    {prevObject:  this}
                );
        },
        sameParents:        function () {
            var _GUID_ = _Parents_.call(this);
            var iTimes = $(DOM.documentElement).attr(_GUID_);

            var $_Result = $(['*[', _GUID_, '="', iTimes, '"]'].join(''))
                    .removeAttr(_GUID_);

            if ( arguments[0] )
                $_Result = $_Result.filter(arguments[0]);

            return  $.extend(
                    Array.prototype.reverse.call($_Result),
                    {prevObject:  this}
                );
        },
        parentsUntil:       function () {
            return  this.parents().not(
                    $(arguments[0]).parents().addBack()
                );
        },
        children:           function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = _Concat_.apply($_Result, this[i].children);

            $_Result = $($_Result);
            if ( arguments[0] )
                $_Result = $_Result.filter(arguments[0]);

            return  $.extend($_Result, {prevObject:  this});
        },
        contents:           function () {
            var $_Result = [ ],
                Type_Filter = parseInt(arguments[0]);

            for (var i = 0;  i < this.length;  i++)
                $_Result = $_Result.concat(
                    (this[i].tagName.toLowerCase() != 'iframe') ?
                        $.makeArray(this[i].childNodes) : this[i].contentWindow.document
                );

            if ($.type(Type_Filter) == 'Number')
                for (var i = 0;  i < $_Result.length;  i++)
                    if ($_Result[i].nodeType != Type_Filter)
                        $_Result[i] = null;

            return  $.extend($($_Result), {prevObject:  this});
        },
        siblings:           function () {
            var _GUID_ = $.guid();
            var $_This = this.prop('iQuery_ID', _GUID_);

            var $_Result = this.parent().children();
            for (var i = 0;  i < $_Result.length;  i++)
                if ($_Result[i].iQuery_ID == _GUID_)
                    $_Result[i] = $_Result[i].iQuery_ID = null;

            $_Result = $( $.makeArray($_Result) );
            if ( arguments[0] )
                $_Result = $_Result.filter(arguments[0]);

            return  $.extend($_Result, {prevObject:  $_This});
        },
        find:               function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = _Concat_.apply($_Result,  $(arguments[0], this[i]));

            return  $.extend($($_Result), {prevObject:  this});
        },
        text:               function (iText) {
            var iResult = [ ];

            for (var i = 0;  i < this.length;  i++)
                if (! $.isData(iText))
                    iResult.push( _Get_Set_.innerText.get(this[i]) );
                else
                    _Get_Set_.innerText.set(this[i], iText);

            return  iResult.length ? iResult.join('') : this;
        },
        html:               function (iHTML) {
            if (! $.isData(iHTML))
                return this[0].innerHTML;

            for (var i = 0;  i < this.length;  i++)
                this[i].innerHTML = iHTML;

            return  this;
        },
        css:                function () {
            return  _Operator_('Style', this, arguments[0], arguments[1]);
        },
        hide:               function () {
            for (var i = 0, $_This;  i < this.length;  i++) {
                $_This = $(this[i]);
                $_This.data('display', $_This.css('display'))
                    .css('display', 'none');
            }
            return this;
        },
        show:               function () {
            for (var i = 0, $_This;  i < this.length;  i++) {
                $_This = $(this[i]);
                $_This.css({
                    display:       $_This.data('display') || 'origin',
                    visibility:    'visible',
                    opacity:       1
                });
            }
            return this;
        },
        width:              function () {
            switch ( $.type(this[0]) ) {
                case 'Document':    return  Math.max(
                        DOM.documentElement.scrollWidth,
                        DOM.body.scrollWidth
                    );  break;
                case 'Window':      return  BOM.innerWidth || Math.max(
                        DOM.documentElement.clientWidth,
                        DOM.body.clientWidth
                    );  break;
                default:            return  this.css('width', arguments[0]);
            }
        },
        height:             function () {
            switch ( $.type(this[0]) ) {
                case 'Document':    return  Math.max(
                        DOM.documentElement.scrollHeight,
                        DOM.body.scrollHeight
                    );  break;
                case 'Window':      return  BOM.innerHeight || Math.max(
                        DOM.documentElement.clientHeight,
                        DOM.body.clientHeight
                    );  break;
                default:            return  this.css('height', arguments[0]);
            }
        },
        position:           function () {
            return  {
                    left:    this[0].offsetLeft,
                    top:     this[0].offsetTop
                };
        },
        offset:             DOM_Offset,
        addClass:           function (new_Class) {
            new_Class = new_Class.trim().split(/\s+/);

            return  this.each(function () {
                    $(this).attr('class',  function (_Index_, old_Class) {
                        old_Class = (old_Class || '').trim().split(/\s+/);

                        for (var i = 0;  i < new_Class.length;  i++)
                            if ($.inArray(old_Class, new_Class[i]) == -1)
                                old_Class.push( new_Class[i] );

                        return  old_Class.join(' ').trim();
                    });
                });
        },
        removeClass:        function (iClass) {
            iClass = iClass.trim().split(/\s+/);

            return  this.each(function () {
                    $(this).attr('class',  function (_Index_, old_Class) {
                        old_Class = (old_Class || '').trim().split(/\s+/);
                        if (! old_Class[0])  return;

                        for (var i = 0;  i < old_Class.length;  i++)
                            if ($.inArray(iClass, old_Class[i]) > -1)
                                delete old_Class[i];

                        return  old_Class.join(' ').trim();
                    });
                });
        },
        hasClass:           function (iClass) {
            iClass = iClass.trim();

            if (! DOM.documentElement.classList)
                return  ((' ' + this.attr('class') + ' ').indexOf(' ' + iClass + ' ') > -1);
            else
                return  this[0].classList.contains(iClass);
        },
        bind:               function (iType, iCallback) {
            iType = iType.trim().split(/\s+/);

            return  this.each(function () {
                    var $_This = $(this);

                    for (var i = 0, Event_Data;  i < iType.length;  i++) {
                        Event_Data = $_This.data('_event_') || { };

                        if (! Event_Data[iType[i]]) {
                            Event_Data[iType[i]] = [ ];
                            this.addEventListener(iType[i], Proxy_Handler);
                        }
                        Event_Data[iType[i]].push(iCallback);

                        $_This.data('_event_', Event_Data);
                    }
                });
        },
        unbind:             function (iType, iCallback) {
            iType = iType.trim().split(/\s+/);

            return  this.each(function () {
                    var $_This = $(this);

                    for (var i = 0, Event_Data, This_Event;  i < iType.length;  i++) {
                        Event_Data = $_This.data('_event_') || { };
                        This_Event = Event_Data[iType[i]];

                        if (iCallback)
                            This_Event.splice(This_Event.indexOf(iCallback), 1);
                        if ((! iCallback) || (! This_Event.length))
                            Event_Data[iType[i]] = null;
                        if (! Event_Data[iType[i]])
                            this.removeEventListener(iType[i], Proxy_Handler);

                        $_This.data('_event_', Event_Data);
                    }
                });
        },
        on:                 function (iType, iFilter, iCallback) {
            if (typeof iFilter != 'string')
                return  this.bind.apply(this, arguments);
            else
                return  this.bind(iType, function () {
                        var iArgs = $.makeArray(arguments);

                        var $_Filter = $(iFilter, this),
                            $_Target = $(iArgs[0].target),
                            iReturn;

                        var $_Patch = $_Target.parents();
                        Array.prototype.unshift.call($_Patch, $_Target[0]);

                        for (var i = 0, _Return_;  i < $_Patch.length;  i++) {
                            if ($_Patch[i] === this)  break;
                            if ($.inArray($_Filter, $_Patch[i]) == -1)  continue;

                            if (iArgs[1] === null)
                                iArgs = [ iArgs[0] ].concat( $($_Patch[i]).data('_trigger_') );
                            _Return_ = iCallback.apply($_Patch[i], iArgs);
                            if (iReturn !== false)
                                iReturn = _Return_;
                        }

                        return iReturn;
                    });
        },
        one:                function () {
            var iArgs = $.makeArray(arguments);
            var iCallback = iArgs[iArgs.length - 1];

            iArgs.splice(-1,  1,  function () {
                $.fn.unbind.apply($(this), iArgs);

                return  iCallback.apply(this, arguments);
            });

            return  this.on.apply(this, iArgs);
        },
        trigger:            function (iType, iData) {
            if (typeof iType != 'string') {
                var iEvent = iType;
                iType = iEvent.type;
            }
            return Event_Trigger.call(
                    this,
                    (iType in Type_Info.DOM_Event) ? 'HTMLEvents' : 'CustomEvent',
                    iType,
                    iData
                );
        },
        triggerHandler:     function () {
            var iHandler = $(this[0]).data('_event_'),  iReturn;
            iHandler = iHandler && iHandler[arguments[0]];

            if (! iHandler)  return;

            for (var i = 0;  i < iHandler.length;  i++)
                iReturn = iHandler[i].apply(
                    this[0],  _Concat_.apply([ ], arguments)
                );

            return iReturn;
        },
        append:             function () {
            var $_Child = $(arguments[0], arguments[1]),
                DOM_Cache = DOM.createDocumentFragment();

            for (var i = 0;  i < $_Child.length;  i++)
                DOM_Cache.appendChild( $_Child[i] );

            this[0].appendChild(DOM_Cache);

            return this;
        },
        appendTo:           function () {
            $(arguments[0], arguments[1]).append(this);

            return  this;
        },
        before:             function () {
            var $_Brother = $(arguments[0], arguments[1]);

            for (var i = 0;  i < $_Brother.length;  i++)
                this[0].parentNode.insertBefore($_Brother[i], this[0]);

            return this;
        },
        prepend:            function () {
            if (this.length) {
                if (! this[0].children.length)
                    $.fn.append.apply(this, arguments);
                else
                    $.fn.before.apply($(this[0].children[0]), arguments);
            }
            return this;
        },
        prependTo:          function () {
            $(arguments[0], arguments[1]).prepend(this);

            return  this;
        },
        clone:              function (iDeep) {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++) {
                $_Result[i] = this[i].cloneNode(iDeep);
                _Get_Set_.Data.clone(this[i], $_Result[i]);
            }

            return  $.extend($($_Result), {prevObject:  this});
        },
        detach:             function () {
            for (var i = 0;  i < this.length;  i++)
                if (this[i].parentNode)
                    this[i].parentNode.removeChild(this[i]);

            return this;
        },
        remove:             function () {
            return this.detach().data();
        },
        empty:              function () {
            var iChild = this.children().remove();

            for (var i = 0;  i < iChild.length;  i++)
                iChild[i].innerHTML = '';

            return this;
        },
        val:                function () {
            if (! $.isData(arguments[0]))
                return  this[0] && this[0].value;
            else
                return  this.attr('value', arguments[0]);
        },
        serializeArray:     function () {
            var $_Value = this.find('*[name]').not(':button, [disabled]'),
                iValue = [ ];

            for (var i = 0;  i < $_Value.length;  i++)
                iValue.push({
                    name:     $_Value[i].name,
                    value:    $_Value[i].value
                });

            return iValue;
        }
    });

    /* ----- HTTP Client ----- */
    function X_Domain(Target_URL) {
        var iLocation = BOM.location;
        Target_URL = Target_URL.match(/^(\w+?(s)?:)?\/\/([\w\d:]+@)?([^\/\:\@]+)(:(\d+))?/);

        if (! Target_URL)  return false;
        if (Target_URL[1] && (Target_URL[1] != iLocation.protocol))  return true;
        if (Target_URL[4] && (Target_URL[4] != iLocation.hostname))  return true;
        var iPort = iLocation.port || (
                (iLocation.protocol == 'http:') && 80
            ) || (
                (iLocation.protocol == 'https:') && 443
            );
        if (Target_URL[6] && (Target_URL[6] != iPort))  return true;
    }

    if ($.browser.msie < 10)
        BOM.XDomainRequest.prototype.setRequestHeader = function () {
            console.warn("IE 8/9 XDR doesn't support Changing HTTP Headers...");
        };

    function iAJAX(This_Call, X_Domain) {
        var iXHR = new BOM[
                (X_Domain && ($.browser.msie < 10)) ? 'XDomainRequest' : 'XMLHttpRequest'
            ]();

        var _Open_ = iXHR.open;
        iXHR.open = function () {
            var _This_ = this;

            _This_[
                X_Domain ? 'onload' : 'onreadystatechange'
            ] = function () {
                if (! (X_Domain || (_This_.readyState == 4)))  return;

                if (typeof iXHR.onready == 'function')
                    iXHR.onready.call(iXHR, iXHR.responseAny());
                iXHR = null;
            };
            _Open_.apply(_This_, arguments);
        };

        return  $.extend(iXHR, {
                responseAny:    function () {
                    var iContent = this.responseText,
                        iType = this.responseType || 'text/plain';

                    switch ( iType.split('/')[1] ) {
                        case 'plain':    ;
                        case 'json':     {
                            var _Content_ = iContent.trim();
                            try {
                                iContent = BOM.JSON.parseAll(_Content_);
                            } catch (iError) {
                                if ($.browser.msie != 9)  try {
                                    iContent = $.parseXML(_Content_);
                                } catch (iError) { }
                            }
                            break;
                        }
                        case 'xml':      iContent = this.responseXML;
                    }

                    return iContent;
                },
                timeOut:        function (TimeOut_Seconds, TimeOut_Callback) {
                    var iXHR = this;

                    $.wait(TimeOut_Seconds, function () {
                        iXHR.onreadystatechange = null;
                        iXHR.abort();
                        TimeOut_Callback.call(iXHR);
                    });
                },
                retry:    function (Wait_Seconds) {
                    $.wait(Wait_Seconds, function () {
                        This_Call.callee.apply(BOM, This_Call);
                    });
                }
            });
    }

    function ECDS_Post(iCallback) {
        var $_Button = this.find(':button').attr('disabled', true),
            iTarget = this.attr('target');
        if ((! iTarget) || (iTarget in Type_Info.Target)) {
            iTarget = $.guid('iframe');
            this.attr('target', iTarget);
        }

        var $_iFrame = $('iframe[name="' + iTarget + '"]');
        if (! $_iFrame.length)
            $_iFrame = $('<iframe />', {
                frameBorder:          0,
                allowTransparency:    true,
                name:                 iTarget
            });

        var $_This = this;
        $_iFrame.hide().appendTo( this.parent() ).on('load', function () {
            $_Button.prop('disabled', false);
            try {
                var $_Content = $(this).contents();
                iCallback.call(
                    $_This[0],  $_Content.find('body').text(),  $_Content
                );
            } catch (iError) { }
        });
        this.submit();
    }

    function iHTTP(iURL, iData, iCallback) {
        if ($.type(iData) == 'Element') {
            var $_Form = $(iData);
            iData = { };

            if ($_Form[0].tagName.toLowerCase() == 'form') {
                if (! $_Form.find('input[type="file"]').length) {
                    var _Data_ = $_Form.serializeArray();
                    for (var i = 0;  i < _Data_.length;  i++)
                        iData[_Data_[i].name] = _Data_[i].value;
                } else {
                    if (! ($.browser.msie < 10))
                        iData = new FormData($_Form[0]);
                    else {
                        ECDS_Post.call($_Form, iCallback);
                        return;
                    }
                }
            }
        }
        if ( $.isPlainObject(iData) )
            iData = BOM.encodeURI( $.param(iData || { }) );

        var HTTP_Client = iAJAX(arguments, X_Domain(iURL));
        HTTP_Client.onready = iCallback;
        HTTP_Client.open(iData ? 'POST' : 'GET',  iURL,  true);
        HTTP_Client.withCredentials = true;
        if (typeof iData == 'string')
            HTTP_Client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        HTTP_Client.send(iData);

        return HTTP_Client;
    }

    $.extend($, {
        JSONP:    { },
        get:      function (iURL, iData, iCallback) {
            iURL = iURL.split('?');
            iURL[1] = iURL.slice(1).join('?');
            iURL.length = 2;

            if (typeof iData == 'function') {
                iCallback = iData;
                iData = { };
            }

            var iArgs = $.paramJSON(iURL[1]),
                iJSONP;
            for (var iName in iArgs)
                if (iArgs[iName] == '?') {
                    iJSONP = $.guid();
                    this.JSONP[iJSONP] = iCallback;
                    iArgs[iName] = 'iQuery.JSONP.' + iJSONP;
                    break;
                }

            iURL = iURL[0] + '?' + $.param(
                $.extend(iArgs,  iData,  {_: $.now()})
            );
            if (! iJSONP)
                return  iHTTP(iURL, null, iCallback);

            $('<script />', {
                src:       iURL,
                onload:    function () {
                    delete $.JSONP[iJSONP];
                    $(this).remove();
                }
            }).appendTo(DOM.head);
        },
        post:     iHTTP
    });

    $.getJSON = $.get;

    /* ----- Event ShortCut ----- */
    $.fn.off = $.fn.unbind;

    var iShortCut = $.extend(_inKey_('tap', 'press', 'swipe'),  Type_Info.DOM_Event),
        no_ShortCut = _inKey_(
            'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'mousewheel',
            'load', 'DOMContentLoaded',
            'DOMAttrModified', 'DOMAttributeNameChanged',
            'DOMCharacterDataModified',
            'DOMElementNameChanged',
            'DOMNodeInserted', 'DOMNodeInsertedIntoDocument',
            'DOMNodeRemoved',  'DOMNodeRemovedFromDocument',
            'DOMSubtreeModified'
        );

    function Event_Method(iName) {
        return  function () {
                if (! arguments[0]) {
                    for (var i = 0;  i < this.length;  i++)  try {
                        this[i][iName]();
                    } catch (iError) {
                        $(this[i]).trigger(iName);
                    }
                } else
                    this.bind(iName, arguments[0]);

                return this;
            };
    }

    for (var iName in iShortCut)
        if (! (iName in no_ShortCut))
            $.fn[iName] = Event_Method(iName);

    if ($.browser.mobile)  $.fn.click = $.fn.tap;

/* ---------- jQuery+  v3.5 ---------- */

    /* ----- 远程 Console  v0.1 ----- */

    //  Thank for raphealguo --- http://rapheal.sinaapp.com/2014/11/06/javascript-error-monitor/

    var Console_URL = $('head link[rel="console"]').attr('href');

    BOM.onerror = function (iMessage, iURL, iLine, iColumn, iError){
        $.wait(0,  function () {
            var iData = {
                    message:    iMessage,
                    url:        iURL,
                    line:       iLine,
                    column:     iColumn  ||  (BOM.event && BOM.event.errorCharacter)  ||  0
                };

            if (iError && iError.stack)
                iData.stack = (iError.stack || iError.stacktrace).toString();

            if (Console_URL) {
                if (iData.stack)
                    $.post(Console_URL, iData);
                else
                    $.get(Console_URL, iData);
            }
        });

        return true;
    };

    /* ----- Hash 算法集合（浏览器原生） v0.1 ----- */

    //  Thank for "emu" --- http://blog.csdn.net/emu/article/details/39618297

    function BufferToString(iBuffer){
        var iDataView = new DataView(iBuffer),
            iResult = [ ];

        for (var i = 0, iTemp;  i < iBuffer.byteLength;  i += 4) {
            iTemp = iDataView.getUint32(i).toString(16);
            iResult.push(
                ((iTemp.length == 8) ? '' : '0') + iTemp
            );
        }
        return iResult.join('');
    }

    $.dataHash = function (iAlgorithm, iData, iCallback, iFailback) {
        var iCrypto = BOM.crypto || BOM.msCrypto;
        var iSubtle = iCrypto.subtle || iCrypto.webkitSubtle;

        iAlgorithm = iAlgorithm || 'SHA-512';
        iFailback = iFailback || iCallback;

        try {
            iData = iData.split('');
            for (var i = 0;  i < iData.length;  i++)
                iData[i] = iData[i].charCodeAt(0);

            var iPromise = iSubtle.digest(
                    {name:  iAlgorithm},
                    new Uint8Array(iData)
                );

            if(typeof iPromise.then == 'function')
                iPromise.then(
                    function() {
                        iCallback.call(this, BufferToString(arguments[0]));
                    },
                    iFailback
                );
            else
                iPromise.oncomplete = function(){
                    iCallback.call(this,  BufferToString( arguments[0].target.result ));
                };
        } catch (iError) {
            iFailback(iError);
        }
    };

    /* ----- CSS 规则操作  v0.7 ----- */

    function CSS_Rule2Text(iRule) {
        var Rule_Text = [''],  Rule_Block,  _Rule_Block_;

        $.each(iRule,  function (iSelector) {
            Rule_Block = iSelector + ' {';
            _Rule_Block_ = [ ];

            for (var iAttribute in this)
                _Rule_Block_.push(
                    _Operator_('Style', [null], iAttribute, this[iAttribute])
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
        if (iMedia)  CSS_Text = [
                '@media ' + iMedia + ' {',
                CSS_Text.replace(/\n/m, "\n    "),
                '}'
            ].join("\n");

        var $_Style = $('<style />', {
                type:       'text/css',
                'class':    'jQuery_CSS-Rule'
            });

        if ($.browser.modern)
            $_Style.html(CSS_Text);
        else
            $_Style[0].styleSheet.cssText = CSS_Text;

        $_Style.appendTo(DOM.head);

        return $_Style[0].sheet;
    };

    $.fn.cssRule = function (iRule, iCallback) {
        return  this.each(function () {
                var $_This = $(this);
                var _GUID_ = $_This.data('css') || $.guid();

                $(this).attr('data-css', _GUID_);
                for (var iSelector in iRule) {
                    iRule['*[data-css="' + _GUID_ + '"]' + iSelector] = iRule[iSelector];
                    delete iRule[iSelector];
                }

                var iSheet = $.cssRule(iRule);

                if (iCallback)
                    iCallback.call(this, iSheet);
            });
    };

    var Pseudo_RE = /:{1,2}[\w\-]+/g;

    $.cssPseudo = function () {
        var Pseudo_Rule = [ ];

        $.each(arguments[0] || DOM.styleSheets,  function () {
            var iRule = this.cssRules;
            if (! iRule)  return;

            for (var i = 0, iPseudo;  i < iRule.length;  i++)
                if (! iRule[i].cssRules) {
                    iPseudo = iRule[i].cssText.match(Pseudo_RE);
                    if (! iPseudo)  continue;

                    for (var j = 0;  j < iPseudo.length;  j++)
                        iPseudo[j] = iPseudo[j].split(':').slice(-1)[0];
                    iRule[i].pseudo = iPseudo;
                    iRule[i].selectorText = iRule[i].selectorText ||
                        iRule[i].cssText.match(/^(.+?)\s*\{/)[1];
                    Pseudo_Rule.push(iRule[i]);
                } else
                    arguments.callee.call(iRule[i], i, iRule[i]);
        });

        return Pseudo_Rule;
    };

    /* ----- DOM UI 数据读写  v0.3 ----- */
    function Value_Operator(iValue, iResource) {
        var $_This = $(this),  iReturn;

        switch ( this.tagName.toLowerCase() ) {
            case 'img':      {
                iReturn = $_This.one('load',  function () {
                    $(this).trigger('Ready');
                }).addClass('jQuery_Loading').attr('src', iValue);
                iResource.count++ ;
                console.log(this);
            }  break;
            case 'input':    iReturn = $_This.attr('value', iValue);  break;
            default:         {
                var _Set_ = iValue || $.isData(iValue),
                    End_Element = (! this.children.length),
                    _BGI_ = (typeof iValue == 'string') && iValue.match(/^\w+:\/\/[^\/]+/);

                if (_Set_) {
                    if ((! End_Element) && _BGI_)
                        $_This.css('background-image',  'url("' + iValue + '")');
                    else
                        $_This.html(iValue);
                } else {
                    _BGI_ = $_This.css('background-image').match(/^url\(('|")?([^'"]+)('|")?\)/);
                    _BGI_ = _BGI_ && _BGI_[2];
                    iReturn = End_Element ? $_This.text() : _BGI_;
                    iReturn = $.isData(iReturn) ? iReturn : _BGI_;
                }
            }
        }
        return iReturn;
    }

    $.fn.value = function (iFiller) {
        if (! iFiller)
            return Value_Operator.call(this[0]);
        else if ( $.isPlainObject(iFiller) )
            var Data_Set = true;

        var $_This = this,
            Resource_Ready = {count:  0};

        this.on('Ready',  'img.jQuery_Loading',  function () {
            $(this).removeClass('jQuery_Loading');
            if (--Resource_Ready.count == 0)
                $_This.trigger('Ready');
            console.log(Resource_Ready.count, this);
            return false;
        });

        for (var i = 0, iName;  i < this.length;  i++) {
            iName = this[i].getAttribute('name');

            Value_Operator.call(
                this[i],
                Data_Set  ?  iFiller[iName]  :  iFiller.call(this[i], iName),
                Resource_Ready
            );
        }
        return this;
    };

    /* ----- jQuery 选择符合法性判断  v0.1 ----- */

    $.is_Selector = function (iString) {
        if (! iString)  return false;

        iString = $.trim(
            iString.replace(/([^\.])(\.|#|\[|:){1,2}[^\.#\[:\s>\+~]+/, '$1')
        );
        if (! iString)  return true;

        if ($('<' + iString + ' />')[0] instanceof HTMLUnknownElement)
            return false;
        return true;
    };

    /* ----- jQuery 对象 所在页面 URL 路径  v0.1 ----- */

    $.fn.pagePath = function () {
        var _PP = this[0].baseURI || this[0].ownerDocument.URL;
        _PP = _PP.split('/');
        if (_PP.length > 3) _PP.pop();
        _PP.push('');
        return _PP.join('/');
    };

    /* ----- jQuery 元素 z-index 独立方法  v0.2 ----- */

    function Get_zIndex($_DOM) {
        var _zIndex_ = $_DOM.css('z-index');
        if (_zIndex_ != 'auto')  return parseInt(_zIndex_);

        var $_Parents = $_DOM.parents();
        _zIndex_ = 0;

        $_Parents.each(function () {
            var _Index_ = $(this).css('z-index');

            _zIndex_ = _zIndex_ + (
                (_Index_ == 'auto')  ?  1  :  _Index_
            );
        });

        return ++_zIndex_;
    }

    function Set_zIndex() {
        var $_This = $(this),  _Index_ = 0;

        $_This.siblings().addBack().filter(':visible').each(function () {
            _Index_ = Math.max(_Index_, Get_zIndex( $(this) ));
        });
        $_This.css('z-index', ++_Index_);
    }

    $.fn.zIndex = function (new_Index) {
        if (! $.isData(new_Index))
            return  Get_zIndex(this.eq(0));
        else if (new_Index == '+')
            return  this.each(Set_zIndex);
        else
            return  this.css('z-index',  parseInt(new_Index) || 'auto');
    };

    /* ----- Form 元素 无刷新提交  v0.4 ----- */
    $.fn.post = function (iCallback) {
        if (! this.length)  return this;

        var $_Form = (
                (this[0].tagName.toLowerCase() == 'form') ?
                    this : this.find('form')
            ).eq(0);
        if (! $_Form.length)  return this;

        var $_Button = $_Form.find(':button').attr('disabled', true);
        $_Form.one('submit',  function (iEvent) {
            iEvent.preventDefault();
            iEvent.stopPropagation();
            $_Button.attr('disabled', true);

            $.post(this.action,  this,  function () {
                $_Button.prop('disabled', false);
                iCallback.call($_Form[0], arguments[0]);
            });
        });
        $_Button.prop('disabled', false);

        return this;
    };

})(self, self.document);


 
/* ----- W3C Event Shim ----- */
(function (BOM, DOM, $) {

    if ( $.browser.modern )  return;

    BOM.HTMLEvents = function () {
        $.extend(this, DOM.createEventObject());
        this.bubbles = true;
        this.eventPhase = 3;
        this.view = BOM;
    };

    $.extend(BOM.HTMLEvents.prototype, {
        initEvent:          function () {
            $.extend(this, {
                type:          arguments[0],
                bubbles:       !! arguments[1],
                cancelable:    !! arguments[2]
            });
        },
        preventDefault:     function () {
            BOM.event.returnValue = false;
            this.defaultPrevented = true;
        },
        stopPropagation:    function () {
            BOM.event.cancelBubble = true;
        }
    });

    BOM.CustomEvent = function () { };
    BOM.CustomEvent.prototype = new BOM.HTMLEvents();
    BOM.CustomEvent.prototype.initCustomEvent = function () {
        $.extend(this, {
            type:          arguments[0],
            bubbles:       !! arguments[1],
            cancelable:    !! arguments[2],
            detail:        arguments[3]
        });
    };

    DOM.createEvent = function () {
        return  new BOM[arguments[0]]();
    };

    function IE_Event_Handler(iElement, iCallback) {
        return  function () {
                var iEvent = $.extend(new HTMLEvents(),  BOM.event),
                    Loaded;

                switch (iEvent.type) {
                    case 'readystatechange':    ;
//                            Loaded = iElement.readyState.match(/loaded|complete/);  break;
                    case 'load':
                        Loaded = (iElement.readyState == 'loaded');  break;
                    case 'propertychange':
                        if ( $(iElement).data('custom-event') )
                            iEvent.type = iEvent.propertyName.replace(/^on/i, '');
                    default:
                        Loaded = true;
                }
                if (! Loaded)  return;

                iCallback.call(iElement,  $.extend(iEvent, {
                    target:             iEvent.srcElement,
                    which:              (iEvent.type.slice(0, 3) == 'key') ?
                        iEvent.keyCode  :  [0, 1, 3, 0, 2, 0, 0, 0][iEvent.button],
                    relatedTarget:      ({
                        mouseover:     iEvent.fromElement,
                        mouseout:      iEvent.toElement,
                        mouseenter:    iEvent.fromElement || iEvent.toElement,
                        mouseleave:    iEvent.toElement || iEvent.fromElement
                    })[iEvent.type]
                }));
            };
    }

    function IE_Event_Type(iType) {
        var $_This = $(this);

        if (! (('on' + iType) in this.constructor.prototype)) {
            if (! $_This.data('custom-event')) {
                $_This.data('custom-event', true);
                return 'propertychange';
            } else
                return '';
        } else if (($.type(this) != 'Window') && (iType == 'load'))
            return 'readystatechange';

        return iType;
    }

    var IE_Event_Method = {
            addEventListener:       function (iType, iCallback) {
                var $_This = $(this);

                //  Custom DOM Event
                var _Type_ = 'on' + iType;
                if (! (_Type_ in this.constructor.prototype))
                    if (! $_This.attr(_Type_))
                        $_This.attr(_Type_, $.now());

                iType = IE_Event_Type.call(this, iType);

                //  DOM Content Loading
                var This_DOM = ($.type(this) == 'Document') ?
                        this : (this.ownerDocument || this.document);
                if (iCallback && (iType == 'DOMContentLoaded')) {
                    if (BOM !== BOM.top)  iType = 'load';
                    else {
                        $.every(0.01, function () {
                            try {
                                This_DOM.documentElement.doScroll('left');
                                iCallback.call(This_DOM, BOM.event);
                                return false;
                            } catch (iError) {
                                return;
                            }
                        });
                        return;
                    }
                }
                if (! iType) return;

                $_This.data('ie-handler',  function (_Index_, iHandler) {
                    iHandler = iHandler || {
                        user:     [ ],
                        proxy:    [ ]
                    };
                    iHandler.user.push(iCallback);
                    iHandler.proxy.push( IE_Event_Handler(this, iCallback) );
                    this.attachEvent(
                        'on' + iType,  iHandler.proxy.slice(-1)
                    );
                    return iHandler;
                });
            },
            removeEventListener:    function (iType, iCallback) {
                iType = IE_Event_Type.call(this, iType);

                if (! iType) return;

                var iHandler = $(this).data('ie-handler');
                iHandler = iHandler.proxy[ iHandler.user.indexOf(iCallback) ];
                if (iHandler)
                    this.detachEvent('on' + iType,  iHandler);
            },
            dispatchEvent:          function (iEvent) {
                var $_This = $(this);
                var iType = 'on' + iEvent.type,
                    iOffset = $_This.offset();

                $.extend(iEvent, {
                    clientX:    iOffset.left,
                    clientY:    iOffset.top
                });

                if (iType in this.constructor.prototype)
                    this.fireEvent(iType, iEvent);
                else
                    $_This.attr(iType, $.now());
            }
        };

    $.extend(Element.prototype, IE_Event_Method);
    $.extend(DOM, IE_Event_Method);
    $.extend(BOM, IE_Event_Method);

})(self, self.document, self.iQuery);



/* ---------- Complex Events ---------- */
(function (BOM, DOM, $) {

    /* ----- DOM Ready ----- */
    var $_DOM = $(DOM);
    $.start('DOM_Ready');

    function DOM_Ready_Event() {
        if (DOM.isReady) return;

        var _DOM_Ready_ = (DOM.readyState == 'complete') &&
                DOM.body  &&  DOM.body.lastChild  &&  DOM.getElementById;

        if ((this !== DOM) && (! _DOM_Ready_))
            return;

        DOM.isReady = true;
        BOM.clearTimeout( $_DOM.data('Ready_Timer') );
        $_DOM.data('Load_During', $.end('DOM_Ready'))
            .data('Ready_Event', arguments[0]);
        console.info('[DOM Ready Event]');
        console.log(this, arguments);

        $_DOM.trigger('ready');

        return false;
    }

    $_DOM.data('Ready_Timer',  $.every(0.5, DOM_Ready_Event));
    $_DOM.one('DOMContentLoaded', DOM_Ready_Event);
    $(BOM).one('load', DOM_Ready_Event);

    $.fn.ready = function (iCallback) {
        if ($.type(this[0]) != 'Document')
            throw 'The Ready Method is only used for Document Object !';

        if (! DOM.isReady)
            $_DOM.one('ready', iCallback);
        else
            iCallback.call(this[0],  $.data(DOM, 'Ready_Event'));

        return this;
    };

    /* ----- Mouse Hover ----- */
    var _Float_ = {
            absolute:    true,
            fixed:       true
        };

    $.fn.hover = function (iEnter, iLeave) {
        return  this.bind('mouseover', function () {
                if (
                    $.contains(this, arguments[0].relatedTarget) ||
                    ($(arguments[0].target).css('position') in _Float_)
                )
                    return false;
                iEnter.apply(this, arguments);
            }).bind('mouseout', function () {
                if (
                    $.contains(this, arguments[0].relatedTarget) ||
                    ($(arguments[0].target).css('position') in _Float_)
                )
                    return false;
                (iLeave || iEnter).apply(this, arguments);
            });
    };

    /* ----- Single Finger Touch ----- */
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

    var Touch_Data;

    $(DOM).bind(
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
                iTime = iEvent.timeStamp - Touch_Data.time;

            if (Math.max(Math.abs(swipeLeft), Math.abs(swipeTop)) > 20)
                $(iEvent.target).trigger('swipe',  [swipeLeft, swipeTop]);
            else
                $(iEvent.target).trigger((iTime > 300) ? 'press' : 'tap');
        }
    );

})(self, self.document, self.iQuery);



/* ---------- History API Shim ---------- */
(function (BOM, DOM, $) {

    if (! ($.browser.msie < 10))  return;

    var _State_ = [
            [null, DOM.title, DOM.URL]
        ],
        _Pushing_ = false,
        $_BOM = $(BOM);

    BOM.history.pushState = function (iState, iTitle, iURL) {
        for (var iKey in iState)
            if (! $.isData(iState[iKey]))
                throw ReferenceError("The History State can't be Complex Object !");

        if (typeof iTitle != 'string')
            throw TypeError("The History State needs a Title String !");

        DOM.title = iTitle;
        _Pushing_ = true;
        BOM.location.hash = '_' + (_State_.push(arguments) - 1);
    };

    BOM.history.replaceState = function () {
        _State_ = [ ];
        this.pushState.apply(this, arguments);
    };

    $_BOM.on('hashchange',  function () {
        if (_Pushing_) {
            _Pushing_ = false;
            return;
        }

        var iState = _State_[ BOM.location.hash.slice(2) ];
        if (! iState)  return;

        BOM.history.state = iState[0];
        DOM.title = iState[1];

        $_BOM.trigger('popstate');
    });

})(self, self.document, self.iQuery);



/* ---------- DOM/CSS Animation ---------- */
(function ($) {

    var FPS = 20;

    function KeyFrame(iStart, iEnd, During_Second) {
        During_Second = Number(During_Second) || 1;

        var iKF = [ ],  KF_Sum = FPS * During_Second;
        var iStep = (iEnd - iStart) / KF_Sum;

        for (var i = 0, KFV = iStart; i < KF_Sum; i++) {
            KFV += iStep;
            iKF.push(Number( KFV.toFixed(2) ));
        }
        return iKF;
    }

    $.fn.animate = function (CSS_Final, During_Second) {
        var $_This = this;

        $_This.data('animate', 1);

        $.each(CSS_Final,  function (iName) {
            var iKeyFrame = KeyFrame($_This.css(iName), this, During_Second);

            $.every(1 / FPS,  function () {
                if ($_This.data('animate') && iKeyFrame.length)
                    $_This.css(iName, iKeyFrame.shift());
                else {
                    iKeyFrame = null;
                    return false;
                }
            });
        });

        return $_This;
    };

    $.fx = {interval:  1000 / FPS};

    /* ----- CSS 3 Animation ----- */
    $('head script').eq(0).before('<link />', {
        rel:     'stylesheet',
        type:    'text/css',
        href:    'http://cdn.bootcss.com/animate.css/3.3.0/animate.min.css'
    });

    var Animate_End = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

    $.fn.cssAnimate = function (iType) {
        var _Args_ = $.makeArray(arguments).slice(1);

        var iDuring = (! isNaN(parseFloat(_Args_[0]))) && _Args_.shift();
        var iCallback = (typeof _Args_[0] == 'function') && _Args_.shift();
        var iLoop = _Args_[0];

        var iClass = 'animated ' + iType + (iLoop ? ' infinite' : '');

        this.bind(Animate_End,  function () {
            $(this).off(Animate_End).removeClass(iClass);

            if (iCallback)
                iCallback.apply(this, arguments);
        });

        if (iDuring) {
            iDuring = (iDuring / 1000) + 's';
            this.cssRule({
                ' ': {
                       '-moz-animation-duration':    iDuring,
                    '-webkit-animation-duration':    iDuring,
                         '-o-animation-duration':    iDuring,
                        '-ms-animation-duration':    iDuring,
                            'animation-duration':    iDuring,
                }
            });
        }

        return  this.removeClass('animated').addClass(iClass);
    };

    /* ----- Animation ShortCut ----- */
    var CSS_Animation = [
            'fadeIn', 'fadeOut'
        ];

    function iAnimate(iType) {
        return  function (iCallback, iDuring, iLoop) {
                return  this.cssAnimate(iType, iCallback, iDuring, iLoop);
            };
    }

    for (var i = 0;  i < CSS_Animation.length;  i++)
        $.fn[ CSS_Animation[i] ] = iAnimate( CSS_Animation[i] );

    $.fn.stop = function () {
        return  this.data('animate', 0).removeClass('animated');
    };

})(self.iQuery);



/* ---------- Smart HTML Loading ---------- */
(function (DOM, $) {

    $.fn.load = function (iURL, iData, iCallback) {
        var $_This = this;

        iURL = iURL.trim().split(/\s+/);
        iURL[1] = iURL.slice(1).join(' ');
        iURL.length = 2;
        if (typeof iData == 'function') {
            iCallback = iData;
            iData = null;
        }

        function Append_Back() {
            $_This.children().fadeOut();
            $(arguments[0]).appendTo( $_This.empty() ).fadeIn();

            if (typeof iCallback == 'function')
                for (var i = 0;  i < $_This.length;  i++)
                    iCallback.apply($_This[i], arguments);
        }

        function Load_Back(iHTML) {
            if (! iHTML.match(/<\s*(html|head|body)[^>]*>/i)) {
                Append_Back.apply(this, arguments);
                return;
            }

            var _Context_ = [this, $.makeArray(arguments)];

            $('<iframe />', {
                style:    'display: none'
            }).one('load',  function () {
                var $_iFrame = $(this),
                    _DOM_ = this.contentWindow.document;

                $.every(0.04,  function () {
                    if (! (_DOM_.body && _DOM_.body.childNodes.length))
                        return;

                    var $_Content = $(iURL[1] || 'body > *',  _DOM_);
                    if (! $_Content.length)
                        $_Content = _DOM_.body.childNodes;

                    Append_Back.apply(
                        _Context_[0],
                        _Context_[1].splice(0,  1,  $('head style', _DOM_).add($_Content))
                    );

                    $_iFrame.remove();
                    return false;
                });
                _DOM_.write(iHTML);
                _DOM_.close();
            }).appendTo(DOM.body);
        }

        if (! iData)
            $.get(iURL[0], Load_Back);
        else
            $.post(iURL[0], iData, Load_Back);

        return this;
    };

})(self.document, self.iQuery);