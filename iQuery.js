//
//                >>>  iQuery.js  <<<
//
//
//      [Version]    v1.0  (2015-9-11)  Stable
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
                iString.push( String(arguments[i]) );

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

    /* ----- String Extension ----- */

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

    String.prototype.toCamelCase = function () {
        var iName = this.split(arguments[0] || '-');

        for (var i = 1;  i < iName.length;  i++)
            iName[i] = iName[i][0].toUpperCase() + iName[i].slice(1);

        return iName.join('');
    };

    String.prototype.toHyphenCase = function () {
        var iString = [ ];

        for (var i = 0;  i < this.length;  i++)  switch (true) {
            case ((this[i] >= 'A')  &&  (this[i] < 'a')):    {
                iString.push('-');
                iString.push( this[i].toLowerCase() );
                break;
            }
            case ((this[i] < '0')  ||  (this[i] > 'z')):     {
                iString.push('-');
                break;
            }
            default:
                iString.push( this[i] );
        }

        return iString.join('');
    };

    /* ----- Array Extension ----- */

    if (! [ ].indexOf)
        Array.prototype.indexOf = function () {
            for (var i = 0;  i < this.length;  i++)
                if (arguments[0] === this[i])
                    return i;

            return -1;
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
        return  this.parse(iJSON,  function (iKey, iValue) {
                if (iKey && (typeof iValue == 'string'))  try {
                    return  BOM.JSON.parse(iValue);
                } catch (iError) { }

                return iValue;
            });
    };

    /* ----- New Window Fix  v0.3 ----- */

    BOM.new_Window_Fix = function (Fix_More) {
        if (! this)  return false;

        try {
            var _Window_ = this.opener,
                This_DOM = this.document;

            This_DOM.defaultView = this;

            if (_Window_ && (this.location.href == 'about:blank'))
                This_DOM.domain = _Window_.document.domain;

            if (! (_Window_ || this).navigator.userAgent.match(/MSIE 8/i))
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



/* ---------- iQuery Core & API ---------- */
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

    var is_iOS = UA.match(/(iTouch|iPhone|iPad|iWatch);[^\)]+CPU[^\)]+OS (\d+_\d+)/i),
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
    var _Object_ = {
            isEmptyObject:    function () {
                for (var iKey in arguments[0])
                    return false;
                return true;
            },
            isPlainObject:    function (iValue) {
                return  iValue && (iValue.constructor === Object);
            },
            each:             function (Arr_Obj, iEvery) {
                if (Arr_Obj) {
                    if (typeof Arr_Obj.length == 'number') {
                        for (var i = 0;  i < Arr_Obj.length;  i++)
                            if (iEvery.call(Arr_Obj[i], i, Arr_Obj[i]) === false)
                                break;
                    } else  for (var iKey in Arr_Obj)
                        if (iEvery.call(Arr_Obj[iKey], iKey, Arr_Obj[iKey]) === false)
                            break;
                }
                return Arr_Obj;
            },
            extend:           function () {
                var iDeep = (arguments[0] === true);
                var iTarget,
                    iFirst = iDeep ? 1 : 0;

                if (arguments.length  >  (iFirst + 1)) {
                    iTarget = arguments[iFirst] || (
                        (arguments[iFirst + 1] instanceof Array)  ?  [ ]  :  { }
                    );
                    iFirst++ ;
                } else
                    iTarget = this;

                for (var i = iFirst, iValue;  i < arguments.length;  i++)
                    for (var iKey in arguments[i])
                        if (
                            Object.prototype.hasOwnProperty.call(arguments[i], iKey)  &&
                            (arguments[i][iKey] !== undefined)
                        ) {
                            iTarget[iKey] = iValue = arguments[i][iKey];

                            if (iDeep)  try {
                                if ((iValue instanceof Array)  ||  _Object_.isPlainObject(iValue))
                                    iTarget[iKey] = arguments.callee.call(this, true, undefined, iValue);
                            } catch (iError) { }
                        }
                return iTarget;
            },
            map:              function (iSource, iCallback) {
                var iTarget = { },  iArray;

                if (typeof iSource.length == 'number') {
                    iTarget = [ ];
                    iArray = true;
                }

                if (typeof iCallback == 'function')
                    this.each(iSource,  function (iKey) {
                        if (this === undefined)  return;

                        var _Element_ = iCallback(arguments[1], iKey, iSource);

                        if ((_Element_ !== undefined)  &&  (_Element_ !== null))
                            if (iArray)
                                iTarget = iTarget.concat(_Element_);
                            else
                                iTarget[iKey] = _Element_;
                    });

                return iTarget;
            },
            makeArray:        function () {
                return  _Browser_.modern ?
                    Array.apply(null, arguments[0])  :  this.extend([ ], arguments[0]);
            },
            inArray:          function () {
                return  Array.prototype.indexOf.call(arguments[0], arguments[1]);
            },
            unique:           function (iArray) {
                var iResult = [ ];

                for (var i = iArray.length - 1;  i > -1 ;  i--)
                    if (this.inArray(iArray, iArray[i]) == i)
                        iResult.push( iArray[i] );

                return iResult;
            }
        };
    function _inKey_() {
        var iObject = { };

        for (var i = 0;  i < arguments.length;  i++)
            iObject[arguments[i]] = true;

        return iObject;
    }

    var Type_Info = {
            Data:         _inKey_('String', 'Number', 'Boolean', 'Null'),
            BOM:          _inKey_('Window', 'DOMWindow', 'global'),
            DOM:          {
                set:        _inKey_('Array', 'HTMLCollection', 'NodeList', 'jQuery', 'iQuery'),
                element:    _inKey_('Window', 'Document', 'HTMLElement'),
                root:       _inKey_('Document', 'Window')
            },
            DOM_Event:    _inKey_(
                'DOMContentLoaded',
                'DOMAttrModified', 'DOMAttributeNameChanged',
                'DOMCharacterDataModified',
                'DOMElementNameChanged',
                'DOMNodeInserted', 'DOMNodeInsertedIntoDocument',
                'DOMNodeRemoved',  'DOMNodeRemovedFromDocument',
                'DOMSubtreeModified'
            )
        };

    _Object_.type = function (iVar) {
        var iType = typeof iVar;

        iType = (iType == 'object') ? (
                (iVar && iVar.constructor.name) ||
                Object.prototype.toString.call(iVar).match(/\[object\s+([^\]]+)\]/i)[1]
            ) : (
                iType[0].toUpperCase() + iType.slice(1)
            );

        if (! iVar)  switch (true) {
            case (isNaN(iVar)  &&  (iVar !== iVar)):    return 'NaN';
            case (iVar === null):                       return 'Null';
            default:                                    return iType;
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
            return 'HTMLElement';

        if ((iType == 'Object')  &&  (typeof iVar.length == 'number')) {
            iType = 'Array';
            if (! _Browser_.modern)  try {
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
    };

    function Object_Seek(iName, iCallback) {
        var iResult = [ ];

        for (var _This_ = this, _Next_, i = 0;  _This_[iName];  _This_ = _Next_, i++) {
            _Next_ = _This_[iName];
            iResult.push(_Next_);
            if ( iCallback )
                iCallback.call(_Next_, i, _Next_);
        }

        return iResult;
    }

    function Array_Concat() {
        var iArgs = _Object_.makeArray(arguments);

        for (var i = 0;  i < iArgs.length;  i++)
            if (
                (! (iArgs[i] instanceof Array))  &&
                (_Object_.type(iArgs[i]) in Type_Info.DOM.set)
            )
                iArgs[i] = _Object_.makeArray(iArgs[i]);

        return  Array.prototype.concat.apply(iArgs.shift(), iArgs);
    }


/* ---------- DOM Info Operator - Get first, Set all. ---------- */
    var _DOM_ = {
            Get_Name_Type:    _inKey_('String', 'Array'),
            operate:          function (iType, iElement, iName, iValue) {
                if ((! iName) || (iValue === null)) {
                    if (this[iType].clear)
                        for (var i = 0;  i < iElement.length;  i++)
                            this[iType].clear(iElement[i], iName);
                    return iElement;
                }
                if ((iValue === undefined) && (_Object_.type(iName) in this.Get_Name_Type)) {
                    if (! iElement.length)
                        return;
                    else if (typeof iName == 'string')
                        return  this[iType].get(iElement[0], iName);
                    else {
                        var iData = { };
                        for (var i = 0;  i < iName.length;  i++)
                            iData[iName[i]] = this[iType].get(iElement[0], iName[i]);
                        return iData;
                    }
                } else {
                    var iResult;

                    if (typeof iName == 'string') {
                        if (typeof iValue == 'function') {
                            for (var i = 0;  i < iElement.length;  i++)
                                iResult = this[iType].set(iElement[i], iName, iValue.call(
                                    iElement[i],  i,  this[iType].get(iElement[i], iName)
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
                            iResult = this[iType].set(iElement[i], iKey, iName[iKey]);

                    return  iResult || iElement;
                }
            }
        };

    /* ----- DOM Attribute ----- */
    _DOM_.Attribute = {
        get:      function (iElement, iName) {
            return  (_Object_.type(iElement) in Type_Info.DOM.root) ?
                    null : iElement.getAttribute(iName);
        },
        set:      function (iElement, iName, iValue) {
            return  (_Object_.type(iElement) in Type_Info.DOM.root) ?
                    false  :  iElement.setAttribute(iName, iValue);
        },
        clear:    function (iElement, iName) {
            iElement.removeAttribute(iName);
        }
    };

    /* ----- DOM Property ----- */
    _DOM_.Property = {
        alias:    {
            'class':    'className',
            'for':      'htmlFor'
        },
        get:      function (iElement, iName) {
            return  iElement[
                    _Browser_.modern  ?  iName  :  (this.alias[iName] || iName)
                ];
        },
        set:      function (iElement, iName, iValue) {
            iElement[this.alias[iName] || iName] = iValue;
        }
    };

    /* ----- DOM Style ----- */
    var Code_Indent = _Browser_.modern ? '' : ' '.repeat(4);

    _DOM_.Style = {
        get:           function (iElement, iName) {
            if ((! iElement) || (_Object_.type(iElement) in Type_Info.DOM.root))
                return null;

            var iStyle = DOM.defaultView.getComputedStyle(iElement, null).getPropertyValue(iName);
            var iNumber = parseFloat(iStyle);

            return  isNaN(iNumber) ? iStyle : iNumber;
        },
        PX_Needed:     _inKey_(
            'width',  'min-width',  'max-width',
            'height', 'min-height', 'max-height',
            'margin', 'padding',
            'top',    'left',
            'border-radius'
        ),
        Set_Method:    _Browser_.modern ? 'setProperty' : 'setAttribute',
        set:           function (iElement, iName, iValue) {
            if (_Object_.type(iElement) in Type_Info.DOM.root)  return false;

            if ((! isNaN( Number(iValue) ))  &&  this.PX_Needed[iName])
                iValue += 'px';

            if (iElement)
                iElement.style[this.Set_Method](iName, String(iValue), 'important');
            else
                return  [iName, ':', Code_Indent, iValue].join('');
        }
    };

    /* ----- DOM Data ----- */
    _DOM_.Data = {
        _Data_:    [ ],
        set:       function (iElement, iName, iValue) {
            if (typeof iElement.dataIndex != 'number')
                iElement.dataIndex = this._Data_.push({ }) - 1;

            this._Data_[iElement.dataIndex][iName] = iValue;
        },
        get:       function (iElement, iName) {
            if (typeof iElement.dataIndex != 'number')
                iElement.dataIndex = this._Data_.push({ }) - 1;

            var iData =  (this._Data_[iElement.dataIndex] || { })[iName]  ||
                    (iElement.dataset || { })[ iName.toCamelCase() ];

            if (typeof iData == 'string')  try {
                iData = BOM.JSON.parseAll(iData);
            } catch (iError) { }

            return  ((iData instanceof Array)  ||  _Object_.isPlainObject(iData))  ?
                    _Object_.extend(true, undefined, iData)  :  iData;
        },
        clear:     function (iElement, iName) {
            if (typeof iElement.dataIndex != 'number')  return;

            if (iName)
                delete this._Data_[iElement.dataIndex][iName];
            else {
                delete this._Data_[iElement.dataIndex];
                delete iElement.dataIndex;
            }
        },
        clone:     function (iOld, iNew) {
            iNew.dataIndex = this._Data_.push({ }) - 1;
            return _Object_.extend(
                    this._Data_[iNew.dataIndex],
                    this._Data_[iOld.dataIndex]
                )._event_;
        }
    };

    /* ----- DOM Content ----- */
    _DOM_.innerText = {
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
                case '':          {
                    iElement.appendChild( DOM.createTextNode(iText) );
                    return;
                }
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

    _DOM_.innerHTML = {
        set:    function (iElement, iHTML) {
            var IE_Scope = String(iHTML).match(
                    /^[^<]*<\s*(head|meta|title|link|style|script|noscript|(!--[^>]*--))[^>]*>/i
                );

            if (_Browser_.modern || (! IE_Scope))
                iElement.innerHTML = iHTML;
            else {
                iElement.innerHTML = 'IE_Scope' + iHTML;
                var iChild = iElement.childNodes;
                iChild[0].nodeValue = iChild[0].nodeValue.slice(8);
                if (! iChild[0].nodeValue.length)
                    iElement.removeChild(iChild[0]);
            }

            return iElement.childNodes;
        }
    };

    /* ----- DOM Offset ----- */
    function DOM_Offset() {
        var iOffset = {
                left:    this[0].offsetLeft,
                top:     this[0].offsetTop
            };

        Object_Seek.call(this[0], 'offsetParent', function () {
            iOffset.left += this.offsetLeft;
            iOffset.top += this.offsetTop;
        });

        return iOffset;
    }


/* ---------- DOM Event ---------- */
    _DOM_.operate('Data',  [BOM],  '_timer_',  { });

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

                _DOM_.operate('Data', [BOM], '_timer_',  function (_Index_, iTimer) {
                    iTimer = iTimer || { };
                    Time_Stamp = iTimer[iName] = _This_.now();
                    return iTimer;
                });

                return Time_Stamp;
            },
            end:        function () {
                var iTimer = _DOM_.operate('Data', [BOM], '_timer_');
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
    function Proxy_Handler(iEvent) {
        var iHandler = (_DOM_.operate('Data', [this], '_event_') || { })[iEvent.type];
        if (! iHandler)  return;

        var Trigger_Data = _DOM_.operate('Data', [this], '_trigger_'),
            iReturn;

        for (var i = 0, _Return_;  i < iHandler.length;  i++) {
            if ( iHandler[i] )
                _Return_ = iHandler[i].apply(this, [iEvent].concat(Trigger_Data));
            else if (iHandler[i] === false)
                _Return_ = false;
            else
                continue;

            if (iReturn !== false)  iReturn = _Return_;
        }

        _DOM_.operate('Data', [this], '_trigger_', null);

        if (iReturn === false) {
            iEvent.preventDefault();
            iEvent.stopPropagation();
        }
    }

/* ---------- DOM Traversal ---------- */
    function _Parents_() {
        var _GUID_ = _Time_.guid('parent');

        for (var i = 0;  i < this.length;  i++)
            Object_Seek.call(this[i],  'parentNode',  function () {
                _DOM_.operate('Attribute',  [this],  _GUID_,  function (_Index_, iTimes) {
                    return  iTimes ? (parseInt(iTimes) + 1) : 1
                });
            });

        return _GUID_;
    }


/* ---------- DOM Constructor ---------- */
    function DOM_Create(TagName, AttrList) {
        var iNew,  iTag = TagName.match(/^\s*<(.+?)\s*\/?>([\s\S]+)?/);

        if (! iTag)  return  [ DOM.createTextNode(TagName) ];

        iNew = (iTag[2]  ||  (iTag[1].split(/\s/).length > 1))  ?
            _DOM_.innerHTML.set(
                DOM.createElement('div'),  TagName
            )  :  [
                DOM.createElement( iTag[1] )
            ];

        if ((iNew.length == 1)  &&  (iNew[0].nodeType == 1)  &&  AttrList)
            _Object_.each(AttrList,  function (iKey) {
                try {
                    switch (iKey) {
                        case 'text':     _DOM_.innerText.set(iNew[0], this);  break;
                        case 'html':     _DOM_.innerHTML.set(iNew[0], this);  break;
                        case 'style':    if ( _Object_.isPlainObject(this) ) {
                            _DOM_.operate('Style', iNew, this);
                            break;
                        }
                        default:         _DOM_.operate('Attribute', iNew, iKey, this);
                    }
                } catch (iError) {
                    console.error(iError);
                }
            });
        if (iNew[0].parentNode)
            iNew = _Object_.map(iNew,  function () {
                iNew[0].parentNode.removeChild( arguments[0] );
                return arguments[0];
            });

        return iNew;
    }


/* ---------- DOM Selector ---------- */
    var iPseudo = {
            ':header':     {
                filter:    function () {
                    return  (arguments[0] instanceof HTMLHeadingElement);
                }
            },
            ':image':      {
                feature:    _Object_.extend(_inKey_('img', 'svg', 'canvas'), {
                    input:    {type:  'image'},
                    link:     {type:  'image/x-icon'}
                }),
                filter:    function (iElement) {
                    var iTag = iElement.tagName.toLowerCase();

                    if (iTag in this.feature)
                        return  (this.feature[iTag] instanceof Boolean) ? true : (
                            this.feature[iTag].type == iElement.type.toLowerCase()
                        );
                }
            },
            ':button':     {
                feature:    _inKey_('button', 'image', 'submit', 'reset'),
                filter:     function (iElement) {
                    var iTag = iElement.tagName.toLowerCase();

                    return  ((iTag == 'button') || (
                        (iTag == 'input') &&
                        (iElement.type.toLowerCase() in this.feature)
                    ));
                }
            },
            ':input':      {
                feature:    _inKey_('input', 'textarea', 'button', 'select'),
                filter:     function () {
                    return  (arguments[0].tagName.toLowerCase() in this.feature);
                }
            },
            ':list':       {
                feature:    _inKey_('ul', 'ol', 'dl'),
                filter:     function () {
                    return  (arguments[0].tagName.toLowerCase() in this.feature);
                }
            },
            ':data':       {
                filter:    function () {
                    return  (! _Object_.isEmptyObject(arguments[0].dataset));
                }
            },
            ':visible':    {
                feature:    {
                    display:    'none',
                    width:      0,
                    height:     0
                },
                filter:     function (iElement) {
                    var iStyle = _DOM_.operate('Style', [iElement], [
                            'display', 'width', 'height'
                        ]);

                    for (var iKey in iStyle)
                        if (iStyle[iKey] === this.feature[iKey])
                            return;
                    return true;
                }
            },
            ':parent':      {
                filter:    function () {
                    var iNode = arguments[0].childNodes;

                    if (! arguments[0].children.length) {
                        for (var i = 0;  i < iNode.length;  i++)
                            if (iNode[i].nodeType == 3)
                                return true;
                    } else  return true;
                }
            }
        };

    _Object_.extend(iPseudo, {
        ':hidden':    {
            filter:    function () {
                return  (! iPseudo[':visible'].filter(arguments[0]));
            }
        },
        ':empty':     {
            filter:    function () {
                return  (! iPseudo[':parent'].filter(arguments[0]));
            }
        }
    });

    for (var _Pseudo_ in iPseudo)
        iPseudo[_Pseudo_].regexp = BOM.iRegExp(
            '(.*?)' + _Pseudo_ + "([>\\+~\\s]*.*)",  undefined,  null
        );

    function DOM_Search(iRoot, iSelector) {
        var _Self_ = arguments.callee;

        return  _Object_.map(iSelector.split(/\s*,\s*/),  function () {
            try {
                return  _Object_.makeArray( iRoot.querySelectorAll(arguments[0] || '*') );
            } catch (iError) {
                var _Selector_;
                for (var _Pseudo_ in iPseudo) {
                    _Selector_ = arguments[0].match(iPseudo[_Pseudo_].regexp);
                    if (_Selector_)  break;
                };
                _Selector_[1] = _Selector_[1] || '*';
                _Selector_[1] += (_Selector_[1].match(/[\s>\+~]\s*$/) ? '*' : '');

                return _Object_.unique(
                    _Object_.map(
                        _Self_(iRoot, _Selector_[1]),
                        function (iDOM) {
                            if ( iPseudo[_Pseudo_].filter(iDOM) )
                                return  _Selector_[2]  ?  _Self_(iDOM,  '*' + _Selector_[2])  :  iDOM;
                        }
                    )
                );
            }
        });
    }


/* ---------- jQuery API ---------- */
    BOM.iQuery = function (Element_Set, iContext) {
        /* ----- Global Wrapper ----- */
        var _Self_ = arguments.callee;

        if (! (this instanceof _Self_))
            return  new _Self_(Element_Set, iContext);
        if (Element_Set instanceof _Self_)
            return  Element_Set;

        /* ----- Constructor ----- */
        this.length = 0;

        if (! Element_Set) return;

        if (typeof Element_Set == 'string') {
            if (Element_Set[0] != '<') {
                this.context = iContext || DOM;
                this.selector = Element_Set;
                Element_Set = DOM_Search(this.context, Element_Set);
            } else
                Element_Set = DOM_Create(
                    Element_Set,  _Object_.isPlainObject(iContext) && iContext
                );
        }
        this.add( Element_Set );
    };

    var $ = BOM.iQuery;
    $.fn = $.prototype;

    $.fn.add = function (Element_Set) {
        var iType = _Object_.type(Element_Set);

        if (iType == 'String')
            Element_Set = $(Element_Set, arguments[1]);
        else if (iType in Type_Info.DOM.element)
            Element_Set = [ Element_Set ];

        if (typeof Element_Set.length == 'number') {
            for (var i = 0;  i < Element_Set.length;  i++)
                if (Element_Set[i] && (
                    (Element_Set[i].nodeType == 1) ||
                    (_Object_.type(Element_Set[i]) in Type_Info.DOM.root)
                ))
                    Array.prototype.push.call(this, Element_Set[i]);

            if (this.length == 1)
                this.context = this[0].ownerDocument;
        }

        return this;
    };

    if (typeof BOM.jQuery != 'function') {
        BOM.jQuery = BOM.iQuery;
        BOM.$ = $;
    }

    /* ----- iQuery Static Method ----- */
    _Object_.extend($, _Object_, _Time_, {
        browser:          _Browser_,
        isData:           function () {
            return  (this.type(arguments[0]) in Type_Info.Data);
        },
        isSelector:       function () {
            try {
                DOM.querySelector(arguments[0])
            } catch (iError) {
                return false;
            }
            return true;
        },
        trim:             function () {
            return  arguments[0].trim();
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
        parseJSON:        BOM.JSON.parse,
        parseXML:         function (iString) {
            iString = iString.trim();
            if ((iString[0] != '<') || (iString[iString.length - 1] != '>'))
                throw 'Illegal XML Format...';

            var iXML = (new BOM.DOMParser()).parseFromString(iString, 'text/xml');
            var iError = iXML.getElementsByTagName('parsererror');
            if (iError.length) {
                throw  new SyntaxError(1, 'Incorrect XML Syntax !');
                console.log(iError[0]);
            }
            iXML.cookie;    //  for old WebKit core to throw Error

            return iXML;
        },
        param:            function (iObject) {
            var iParameter = [ ],  iValue;

            if ( $.isPlainObject(iObject) )
                for (var iName in iObject) {
                    iValue = iObject[iName];

                    if ( $.isPlainObject(iValue) )
                        iValue = BOM.JSON.stringify(iValue);
                    else if (! $.isData(iValue))
                        continue;

                    iParameter.push(iName + '=' + BOM.encodeURIComponent(iValue));
                }
            else if ($.type(iObject) in Type_Info.DOM.set)
                for (var i = 0;  i < iObject.length;  i++)
                    iParameter.push(
                        iObject[i].name + '=' + BOM.encodeURIComponent(iObject[i].value)
                    );

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
                Args_Str[i] = $.split(Args_Str[i], '=', 2);

                iValue = BOM.decodeURIComponent( Args_Str[i][1] );
                try {
                    iValue = BOM.JSON.parse(iValue);
                } catch (iError) { }

                _Args_[ Args_Str[i][0] ] = iValue;
            }

            return  Args_Str.length ? _Args_ : { };
        },
        fileName:         function () {
            return  (arguments[0] || BOM.location.pathname)
                    .split('?')[0].split('/').slice(-1)[0];
        },
        data:             function (iElement, iName, iValue) {
            return  _DOM_.operate('Data', [iElement], iName, iValue);
        },
        contains:         function (iParent, iChild) {
            if (! iChild)  return false;

            if ($.browser.modern)
                return  !!(iParent.compareDocumentPosition(iChild) & 16);
            else
                return  (iParent !== iChild) && iParent.contains(iChild);
        }
    });

    /* ----- iQuery Instance Method ----- */
    function DOM_Scroll(iName) {
        iName = {
            scroll:    'scroll' + iName,
            offset:    (iName == 'Top') ? 'pageYOffset' : 'pageXOffset'
        };

        return  function (iPX) {
            iPX = parseInt(iPX);

            if ( isNaN(iPX) ) {
                iPX = this[0][iName.scroll];
                return  (iPX !== undefined) ? iPX : (
                    this[0].documentElement[iName.scroll] ||
                    this[0].defaultView[iName.offset] ||
                    this[0].body[iName.scroll]
                );
            }
            for (var i = 0;  i < this.length;  i++)
                if (this[i][iName.scroll] !== undefined)
                    this[i][iName.scroll] = iPX;
                else
                    this[i].documentElement[iName.scroll] =
                    this[i].defaultView[iName.offset] =
                    this[i].body[iName.scroll] = iPX;
        };
    }
    $.fn.extend = $.extend;

    $.fn.extend({
        splice:             Array.prototype.splice,
        jquery:             '1.9.1',
        iquery:             '1.0',
        pushStack:          function () {
            var $_New = $(arguments[0]);
            $_New.prevObject = this;
            return $_New;
        },
        eq:                 function () {
            return  this.pushStack( this[arguments[0]] );
        },
        index:              function (iTarget) {
            if (! iTarget)
                return  Object_Seek.call(this[0], 'previousElementSibling').length;

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
            return  this.pushStack( [ ].slice.apply(this, arguments) );
        },
        each:               function () {
            return  $.each(this, arguments[0]);
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

            return this.pushStack($_Result);
        },
        not:                function () {
            var $_Not = $(arguments[0]),
                $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                if ($.inArray($_Not, this[i]) < 0)
                    $_Result.push(this[i]);

            return this.pushStack($_Result);
        },
        attr:               function () {
            return  _DOM_.operate('Attribute', this, arguments[0], arguments[1]);
        },
        removeAttr:         function (iAttr) {
            iAttr = iAttr.trim().split(/\s+/);

            for (var i = 0;  i < iAttr.length;  i++)
                this.attr(iAttr[i], null);

            return this;
        },
        prop:               function () {
            return  _DOM_.operate('Property', this, arguments[0], arguments[1]);
        },
        data:               function () {
            return  _DOM_.operate('Data', this, arguments[0], arguments[1]);
        },
        addBack:            function () {
            var _GUID_ = $.guid();

            var $_Result = $(
                    Array_Concat(this, this.prevObject)
                ).attr('iquery', _GUID_);

            return  this.pushStack(
                    $('*[iquery="' + _GUID_ + '"]').removeAttr('iquery')
                );
        },
        parent:             function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                if ($.inArray($_Result, this[i].parentNode) == -1)
                    $_Result.push( this[i].parentNode );

            if (arguments[0])  $_Result = $($_Result).filter(arguments[0]);

            return this.pushStack($_Result);
        },
        parents:            function () {
            var _GUID_ = _Parents_.call(this);
            var $_Result = $('*[' + _GUID_ + ']').removeAttr(_GUID_);

            if (arguments[0])  $_Result = $_Result.filter(arguments[0]);

            return  this.pushStack( Array.prototype.reverse.call($_Result) );
        },
        sameParents:        function () {
            var _GUID_ = _Parents_.call(this);
            var iTimes = $(DOM.documentElement).attr(_GUID_);

            var $_Result = $(['*[', _GUID_, '="', iTimes, '"]'].join(''))
                    .removeAttr(_GUID_);

            if (arguments[0])  $_Result = $_Result.filter(arguments[0]);

            return  this.pushStack( Array.prototype.reverse.call($_Result) );
        },
        parentsUntil:       function () {
            return  this.parents().not(
                    $(arguments[0]).parents().addBack()
                );
        },
        children:           function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = Array_Concat($_Result, this[i].children);

            if (arguments[0])  $_Result = $($_Result).filter(arguments[0]);

            return this.pushStack($_Result);
        },
        contents:           function () {
            var $_Result = [ ],
                Type_Filter = parseInt(arguments[0]);

            for (var i = 0;  i < this.length;  i++)
                $_Result = Array_Concat(
                    $_Result,
                    (this[i].tagName.toLowerCase() != 'iframe') ?
                        this[i].childNodes : this[i].contentWindow.document
                );
            if ($.type(Type_Filter) == 'Number')
                for (var i = 0;  i < $_Result.length;  i++)
                    if ($_Result[i].nodeType != Type_Filter)
                        $_Result[i] = null;

            return this.pushStack($_Result);
        },
        nextAll:            function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = Array_Concat(
                    $_Result,  Object_Seek.call(this[i], 'nextElementSibling')
                );
            $_Result = $.unique($_Result);

            if (arguments[0])  $_Result = $($_Result).filter(arguments[0]);

            return this.pushStack($_Result);
        },
        prevAll:            function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = Array_Concat(
                    $_Result,  Object_Seek.call(this[i], 'previousElementSibling')
                );
            $_Result = $.unique($_Result);

            if (arguments[0])  $_Result = $($_Result).filter(arguments[0]);

            return this.pushStack($_Result);
        },
        siblings:           function () {
            var $_Result = this.prevAll().add( this.nextAll() );

            if (arguments[0])  $_Result = $_Result.filter(arguments[0]);

            return this.pushStack($_Result);
        },
        find:               function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = Array_Concat($_Result,  $(arguments[0], this[i]));

            return  this.pushStack( $.unique($_Result) );
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
            this.children().remove();

            for (var i = 0, iChild;  i < this.length;  i++) {
                iChild = this[i].childNodes;
                for (var j = 0;  j < iChild.length;  j++)
                    this[i].removeChild(iChild[j]);
            }

            return this;
        },
        text:               function (iText) {
            var iGetter = (! $.isData(iText)),  iResult = [ ];

            if (! iGetter)  this.empty();

            for (var i = 0;  i < this.length;  i++)
                if (iGetter)
                    iResult.push( _DOM_.innerText.get(this[i]) );
                else
                    _DOM_.innerText.set(this[i], iText);

            return  iResult.length ? iResult.join('') : this;
        },
        html:               function (iHTML) {
            if (! $.isData(iHTML))
                return this[0].innerHTML;

            this.empty();

            for (var i = 0;  i < this.length;  i++)
                _DOM_.innerHTML.set(this[i], iHTML);

            return  this;
        },
        css:                function () {
            return  _DOM_.operate('Style', this, arguments[0], arguments[1]);
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
        scrollTop:          DOM_Scroll('Top'),
        scrollLeft:         DOM_Scroll('Left'),
        position:           function () {
            return  {
                    left:    this[0].offsetLeft,
                    top:     this[0].offsetTop
                };
        },
        offset:             DOM_Offset,
        addClass:           function (new_Class) {
            if (typeof new_Class != 'string')  return this;

            new_Class = new_Class.trim().split(/\s+/);

            return  this.attr('class',  function (_Index_, old_Class) {
                old_Class = (old_Class || '').trim().split(/\s+/);

                for (var i = 0;  i < new_Class.length;  i++)
                    if ($.inArray(old_Class, new_Class[i]) == -1)
                        old_Class.push( new_Class[i] );

                return  old_Class.join(' ').trim();
            });
        },
        removeClass:        function (iClass) {
            if (typeof iClass != 'string')  return this;

            iClass = iClass.trim().split(/\s+/);

            return  this.attr('class',  function (_Index_, old_Class) {
                old_Class = (old_Class || '').trim().split(/\s+/);
                if (! old_Class[0])  return;

                var new_Class = [ ];

                for (var i = 0;  i < old_Class.length;  i++)
                    if ($.inArray(iClass, old_Class[i]) == -1)
                        new_Class.push( old_Class[i] );

                return  new_Class.join(' ');
            });
        },
        hasClass:           function (iClass) {
            if (typeof iClass != 'string')  return false;

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

                for (var i = 0;  i < iType.length;  i++)
                    $_This.data('_event_',  function () {
                        var Event_Data = arguments[1] || { };

                        if (! Event_Data[iType[i]]) {
                            Event_Data[iType[i]] = [ ];
                            this.addEventListener(iType[i], Proxy_Handler);
                        }
                        Event_Data[iType[i]].push(iCallback);

                        return Event_Data;
                    });
            });
        },
        unbind:             function (iType, iCallback) {
            iType = iType.trim().split(/\s+/);

            return  this.each(function () {
                var $_This = $(this);

                for (var i = 0;  i < iType.length;  i++)
                    $_This.data('_event_',  function () {
                        var Event_Data = arguments[1] || { };
                        var This_Event = Event_Data[iType[i]];

                        if (iCallback)
                            This_Event.splice(This_Event.indexOf(iCallback), 1);
                        if ((! iCallback) || (! This_Event.length))
                            Event_Data[iType[i]] = null;
                        if (! Event_Data[iType[i]])
                            this.removeEventListener(iType[i], Proxy_Handler);

                        return Event_Data;
                    });
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
        trigger:            function (iType) {
            if (typeof iType != 'string') {
                var _Event_ = iType;
                iType = iType.type;
            }
            this.data('_trigger_', arguments[1]);

            return  this.each(function () {
                _Type_ = (
                    (('on' + iType)  in  this.constructor.prototype)  ||
                    (iType in Type_Info.DOM_Event)
                ) ? 'HTMLEvents' : 'CustomEvent';

                var iEvent = DOM.createEvent(_Type_);
                iEvent['init' + (
                    (_Type_ == 'HTMLEvents')  ?  'Event'  :  _Type_
                )](iType, true, true, 0);
                this.dispatchEvent(
                    _Event_  ?  $.extend(iEvent, _Event_)  :  iEvent
                );
            });
        },
        triggerHandler:     function () {
            var iHandler = $(this[0]).data('_event_');
            iHandler = iHandler && iHandler[arguments[0]];
            if (! iHandler)  return;

            var iArgs = $.makeArray(arguments),  iReturn;
            iArgs.unshift([ ]);
            for (var i = 0;  i < iHandler.length;  i++)
                iReturn = iHandler[i].apply(
                    this[0],  Array_Concat.apply(BOM, iArgs)
                );

            return iReturn;
        },
        clone:              function (iDeep) {
            var $_Result = [ ];

            for (var i = 0, iEvent;  i < this.length;  i++) {
                $_Result[i] = this[i].cloneNode(iDeep);
                iEvent = _DOM_.Data.clone(this[i], $_Result[i]);

                for (var iType in iEvent)
                    $_Result[i].addEventListener(iType, Proxy_Handler, false);
            }

            return this.pushStack($_Result);
        },
        append:             function () {
            var $_Child = $(arguments[0], arguments[1]),
                DOM_Cache = DOM.createDocumentFragment();

            return  this.each(function (Index) {
                    var _Child_ = Index ? $_Child.clone(true) : $_Child,
                        _Cache_ = DOM_Cache.cloneNode();

                    for (var i = 0;  i < _Child_.length;  i++)
                        _Cache_.appendChild( _Child_[i] );

                    this.appendChild(_Cache_);
                });
        },
        appendTo:           function () {
            $(arguments[0], arguments[1]).append(this);

            return  this;
        },
        before:             function () {
            var $_Brother = $(arguments[0], arguments[1]),
                DOM_Cache = DOM.createDocumentFragment();

            return  this.each(function (Index) {
                    var _Brother_ = Index ? $_Brother.clone(true) : $_Brother,
                        _Cache_ = DOM_Cache.cloneNode();

                    for (var i = 0;  i < _Brother_.length;  i++)
                        _Cache_.appendChild( _Brother_[i] );

                    this.parentNode.insertBefore(_Cache_, this);
                });
        },
        prepend:            function () {
            if (this.length) {
                if (! this[0].children.length)
                    this.append.apply(this, arguments);
                else
                    this.before.apply($(this[0].children[0]), arguments);
            }
            return this;
        },
        prependTo:          function () {
            $(arguments[0], arguments[1]).prepend(this);

            return  this;
        },
        val:                function () {
            if (! $.isData(arguments[0]))
                return  this[0] && this[0].value;
            else
                return  this.not('input[type="file"]').prop('value', arguments[0]);
        },
        serializeArray:     function () {
            var $_Value = this.find('*[name]:input').not(':button, [disabled]'),
                iValue = [ ];

            for (var i = 0;  i < $_Value.length;  i++) {
                if ($_Value[i].type.match(/radio|checkbox/i)  &&  (! $_Value[i].checked))
                    continue;

                iValue.push({
                    name:     $_Value[i].name,
                    value:    $_Value[i].value
                });
            }

            return iValue;
        },
        serialize:          function () {
            return  $.param( this.serializeArray() );
        }
    });

/* ---------- Event ShortCut ---------- */
    $.fn.off = $.fn.unbind;

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

    for (var iName in _inKey_(
        'abort', 'error',
        'keydown', 'keypress', 'keyup',
        'mousedown', 'mouseup', 'mousemove',
        'click', 'dblclick', 'scroll',
        'select', 'focus', 'blur', 'change', 'submit', 'reset',
        'tap', 'press', 'swipe'
    ))
        $.fn[iName] = Event_Method(iName);

    if ($.browser.mobile)  $.fn.click = $.fn.tap;



/* ----- DOM UI Data Operator ----- */
    function Value_Operator(iValue, iResource) {
        var $_This = $(this),  iReturn;

        switch ( this.tagName.toLowerCase() ) {
            case 'img':      {
                iReturn = $_This.one('load',  function () {
                    $(this).trigger('ready');
                }).addClass('jQuery_Loading').attr('src', iValue);
                iResource.count++ ;
                console.log(this);
            }  break;
            case 'textarea':    ;
            case 'select':      ;
            case 'input':       {
                if ((this.type || '').match(/radio|checkbox/i)  &&  (this.value == iValue))
                    this.checked = true;
                iReturn = $_This.val(iValue);
                break;
            }
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
        var $_Name = this.filter('*[name]');
        if (! $_Name.length)
            $_Name = this.find('*[name]');

        if (! iFiller)
            return Value_Operator.call($_Name[0]);
        else if ( $.isPlainObject(iFiller) )
            var Data_Set = true;

        var Resource_Ready = {count:  0},  $_This = this;

        this.on('ready',  'img.jQuery_Loading',  function () {
            $(this).removeClass('jQuery_Loading');
            if (--Resource_Ready.count == 0)
                $_This.trigger('ready');
            console.log(Resource_Ready.count, this);
            return false;
        });

        for (var i = 0, iName;  i < $_Name.length;  i++) {
            iName = $_Name[i].getAttribute('name');

            Value_Operator.call(
                $_Name[i],
                Data_Set  ?  iFiller[iName]  :  iFiller.call($_Name[i], iName),
                Resource_Ready
            );
        }
        return this;
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

            _zIndex_ = _zIndex_ + (
                (_Index_ == 'auto')  ?  1  :  _Index_
            );
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


/* ---------- CSS Rule ---------- */
    function CSS_Rule2Text(iRule) {
        var Rule_Text = [''],  Rule_Block,  _Rule_Block_;

        $.each(iRule,  function (iSelector) {
            Rule_Block = iSelector + ' {';
            _Rule_Block_ = [ ];

            for (var iAttribute in this)
                _Rule_Block_.push(
                    _DOM_.operate('Style', [null], iAttribute, this[iAttribute])
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

})(self, self.document);



/* ---------- IE 8- Patch to W3C ---------- */
(function (BOM, DOM, $) {

    if ($.browser.modern)  return;

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
            return  Get_Attribute.call(this,  iAlias[iName] || iName,  0);
        },
        setAttribute:    function (iName) {
            return  Set_Attribute.call(this,  iAlias[iName] || iName,  arguments[1],  0);
        },
        removeAttribute:    function (iName) {
            return  Remove_Attribute.call(this,  iAlias[iName] || iName,  0);
        }
    });

    /* ----- DOM Sibling ----- */
    Object.defineProperty(Element.prototype, 'previousElementSibling', {
        get:    function () {
            return this.previousSibling;
        },
        set:    function () { }
    });

    Object.defineProperty(Element.prototype, 'nextElementSibling', {
        get:    function () {
            return this.nextSibling;
        },
        set:    function () { }
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

            return  isNaN(iNumber) ? iStyle : (iNumber / iScale);
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


    /* ----- Event Object ----- */
    BOM.HTMLEvents = function (iEvent) {
        $.extend(this, DOM.createEventObject());

        if (! iEvent)  return;
        
        $.extend(this, {
            type:               iEvent.type,
            target:             iEvent.srcElement,
            which:              (iEvent.type && (iEvent.type.slice(0, 3) == 'key'))  ?
                iEvent.keyCode  :  [0, 1, 3, 0, 2, 0, 0, 0][iEvent.button],
            relatedTarget:      ({
                mouseover:     iEvent.fromElement,
                mouseout:      iEvent.toElement,
                mouseenter:    iEvent.fromElement || iEvent.toElement,
                mouseleave:    iEvent.toElement || iEvent.fromElement
            })[iEvent.type],
            bubbles:            true,
            eventPhase:         3,
            view:               BOM,
            isTrusted:          false,
            propertyName:       iEvent.propertyName
        });
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

    BOM.CustomEvent = function () {
        BOM.HTMLEvents.call(this, arguments[0]);
    };
    BOM.CustomEvent.prototype = new BOM.HTMLEvents();
    BOM.CustomEvent.prototype.initCustomEvent = function () {
        $.extend(this, {
            type:          arguments[0],
            bubbles:       !! arguments[1],
            cancelable:    !! arguments[2],
            detail:        arguments[3] || 0
        });
    };

    DOM.createEvent = function () {
        return  new BOM[arguments[0]]();
    };

    function IE_Event_Type(iType) {
        if (
            ((BOM !== BOM.top)  &&  (iType == 'DOMContentLoaded'))  ||
            ((iType == 'load')  &&  ($.type(this) != 'Window'))
        )
            return 'onreadystatechange';

        iType = 'on' + iType;

        if (! (iType in this.constructor.prototype))
            return 'onpropertychange';

        return iType;
    }

    function IE_Event_DOM() {
        return  $(
            ((arguments[0] == 'onpropertychange')  &&  ($.type(this) == 'Document'))  ?
                this.documentElement  :  this
        );
    }

    function IE_Event_Handler(iElement, iCallback) {
        return  function () {
                var iEvent = new HTMLEvents(BOM.event),  Loaded;
                iEvent.currentTarget = iElement;

                switch (iEvent.type) {
                    case 'readystatechange':    iEvent.type = 'load';
//                      Loaded = iElement.readyState.match(/loaded|complete/);  break;
                    case 'load':
                        Loaded = (iElement.readyState == 'loaded');  break;
                    case 'propertychange':      {
                        var iType = iEvent.propertyName.match(/^on(.+)/i);
                        if (iType  &&  (IE_Event_Type(iType[1]) == 'onpropertychange'))
                            iEvent.type = iType[1];
                        else {
                            iEvent.type = 'DOMAttrModified';
                            iEvent.attrName = iEvent.propertyName;
                        }
                    }
                    default:                    Loaded = true;
                }
                if (Loaded  &&  (typeof iCallback == 'function'))
                    iCallback.call(iElement, iEvent);
            };
    }

    var IE_Event_Method = {
            addEventListener:       function (iType, iCallback) {
                iType = IE_Event_Type.call(this, iType);
                var $_This = IE_Event_DOM.call(this, iType);

                var _Handler_ = IE_Event_Handler(this, iCallback);

                $_This.data('ie-handler',  function () {
                    var iHandler = arguments[1] || {
                            user:     [ ],
                            proxy:    [ ]
                        };
                    iHandler.user.push(iCallback);
                    iHandler.proxy.push(_Handler_);
                    this.attachEvent(iType, _Handler_);

                    return iHandler;
                });
            },
            removeEventListener:    function (iType, iCallback) {
                iType = IE_Event_Type.call(this, iType);

                IE_Event_DOM.call(this, iType).data('ie-handler',  function () {
                    var iHandler = arguments[1];
                    var _Index_ = iHandler.user.indexOf(iCallback);

                    iHandler.user[_Index_] = null;
                    this.detachEvent(iType,  iHandler.proxy.splice(_Index_, 1, null)[0]);

                    return iHandler;
                });
            },
            dispatchEvent:          function (iEvent) {
                var _Type_ = IE_Event_Type.call(this, iEvent.type);
                var $_This = IE_Event_DOM.call(this, _Type_);

                var iOffset = $_This.offset();
                $.extend(iEvent, {
                    clientX:    iOffset.left,
                    clientY:    iOffset.top
                });

                if (_Type_ != 'onpropertychange')
                    this.fireEvent(_Type_, iEvent);
                else
                    $_This[0]['on' + iEvent.type] = $.now();
            }
        };

    $.extend(Element.prototype, IE_Event_Method);
    $.extend(DOM, IE_Event_Method);
    $.extend(BOM, IE_Event_Method);

    //  DOM Content Loading
    if (BOM === BOM.top)
        $.every(0.01, function () {
            try {
                DOM.documentElement.doScroll('left');
                $(DOM).trigger('DOMContentLoaded');
                return false;
            } catch (iError) {
                return;
            }
        });

    //  Patch for Change Event
    $(DOM.body).on('click',  'input[type="radio"], input[type="checkbox"]',  function () {
        this.blur();
        this.focus();
    });


    /* ----- XML DOM Parser ----- */
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

})(self, self.document, self.iQuery);



/* ---------- W3C HTML 5  Shim ---------- */
(function (BOM, DOM, $) {

    if (! ($.browser.msie < 10))  return;

    /* ----- Element Data Set ----- */
    function DOMStringMap(iElement) {
        for (var i = 0, iAttr;  i < iElement.attributes.length;  i++) {
            iAttr = iElement.attributes[i];
            if (iAttr.nodeName.slice(0, 5) == 'data-')
                this[ iAttr.nodeName.toCamelCase() ] = iAttr.nodeValue;
        }
    }

    Object.defineProperty(Element.prototype, 'dataset', {
        get:    function () {
            return  new DOMStringMap(this);
        },
        set:    function () { }
    });


    /* ----- History API ----- */
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

        $_BOM.trigger({
            type:     'popstate',
            state:    iState[0]
        });
    });

})(self, self.document, self.iQuery);



/* ---------- Complex Events ---------- */
(function (BOM, DOM, $) {

    /* ----- DOM Ready ----- */
    var $_DOM = $(DOM);
    $.start('DOM_Ready');

    function DOM_Ready_Event() {
        if (DOM.isReady || (
            (this !== DOM)  &&  (
                (DOM.readyState != 'complete')  ||  (! DOM.body.lastChild)
            )
        ))
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
                iTime = iEvent.timeStamp - Touch_Data.time;

            if (Math.max(Math.abs(swipeLeft), Math.abs(swipeTop)) > 20)
                $(iEvent.target).trigger('swipe',  [swipeLeft, swipeTop]);
            else
                $(iEvent.target).trigger((iTime > 300) ? 'press' : 'tap');
        }
    );

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

        $_This.data('_animate_', 1);

        $.each(CSS_Final,  function (iName) {
            var iKeyFrame = KeyFrame($_This.css(iName), this, During_Second);

            $.every(1 / FPS,  function () {
                if ($_This.data('_animate_') && iKeyFrame.length)
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
    $('head script').eq(0).before(
        $('<link />', {
            rel:     'stylesheet',
            type:    'text/css',
            href:    'http://cdn.bootcss.com/animate.css/3.3.0/animate.min.css'
        })
    );

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
        return  this.data('_animate_', 0).removeClass('animated');
    };

})(self.iQuery);



/* ---------- HTTP Client ---------- */
(function (BOM, DOM, $) {

    /* ----- XML HTTP Request ----- */
    function X_Domain(Target_URL) {
        var iPort = BOM.location.port || (
                (BOM.location.protocol == 'http:')  &&  80
            ) || (
                (BOM.location.protocol == 'https:')  &&  443
            );
        Target_URL = Target_URL.match(/^(\w+?(s)?:)?\/\/([\w\d:]+@)?([^\/\:\@]+)(:(\d+))?/);

        if (! Target_URL)  return false;
        return (
            (Target_URL[1]  &&  (Target_URL[1] != BOM.location.protocol))  ||
            (Target_URL[4]  &&  (Target_URL[4] != BOM.location.hostname))  ||
            (Target_URL[6]  &&  (Target_URL[6] != iPort))
        );
    }

    var XHR_Extension = {
            timeOut:        function (iSecond, iCallback) {
                var iXHR = this;

                $.wait(iSecond, function () {
                    iXHR[
                        (iXHR.$_DOM || iXHR.crossDomain)  ?  'onload'  :  'onreadystatechange'
                    ] = null;
                    iXHR.abort();
                    iCallback.call(iXHR);
                    iXHR = null;
                });
            },
            responseAny:    function () {
                var iContent = this.responseText,
                    iType = this.responseType || 'text/plain';

                switch ( iType.split('/')[1] ) {
                    case 'plain':    ;
                    case 'json':     {
                        var _Content_ = iContent.trim();
                        try {
                            iContent = BOM.JSON.parseAll(_Content_);
                            this.responseType = 'application/json';
                        } catch (iError) {
                            if ($.browser.msie != 9)  try {
                                if (! $.browser.ff)
                                    iContent = $.parseXML(_Content_);
                                else if (this.responseXML)
                                    iContent = this.responseXML;
                                else
                                    break;
                                this.responseType = 'text/xml';
                            } catch (iError) { }
                        }
                        break;
                    }
                    case 'xml':      iContent = this.responseXML;
                }

                return iContent;
            },
            retry:          function (Wait_Seconds) {
                var iXHR = new this.constructor,
                    iData = this.requestData;
                iXHR.onready = this.onready;
                iXHR.open.apply(iXHR, this.requestArgs);

                $.wait(Wait_Seconds, function () {
                    iXHR.withCredentials = true;
                    if (typeof iData == 'string')
                        iXHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    iXHR.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    iXHR.setRequestHeader('Accept', '*/*');
                    iXHR.send(iData);
                });
            }
        };

    var XHR_Open = BOM.XMLHttpRequest.prototype.open,
        XHR_Send = BOM.XMLHttpRequest.prototype.send;

    $.extend(BOM.XMLHttpRequest.prototype, XHR_Extension, {
        open:           function () {
            this.crossDomain = X_Domain(arguments[1]);

            var iXHR = this;
            this[
                this.crossDomain ? 'onload' : 'onreadystatechange'
            ] = function () {
                if (! (iXHR.crossDomain || (iXHR.readyState == 4)))  return;

                if (typeof iXHR.onready == 'function')
                    iXHR.onready.call(iXHR, iXHR.responseAny());
                iXHR = null;
            };
            XHR_Open.apply(this,  this.requestArgs = arguments);
        },
        send:    function () {
            XHR_Send.call(this,  this.requestData = arguments[0]);
        }
    });

    if ($.browser.msie < 10)
        BOM.XDomainRequest.prototype.setRequestHeader = function () {
            console.warn("IE 8/9 XDR doesn't support Changing HTTP Headers...");
        };

    /* ----- HTML DOM SandBox ----- */
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
                if (! $_Content.length)
                    $_Content = _DOM_.body.childNodes;

                if (
                    (typeof iCallback == 'function')  &&
                    (false === iCallback.call(
                        $_iFrame[0],  $('head style', _DOM_).add($_Content).clone(true)
                    ))
                )
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

    /* ----- DOM HTTP Request ----- */
    BOM.DOMHttpRequest = function () {
        this.status = 0;
        this.readyState = 0;
        this.responseType = 'text/plain';
    };
    BOM.DOMHttpRequest.JSONP = { };

    $.extend(BOM.DOMHttpRequest.prototype, XHR_Extension, {
        open:                function (iMethod, iTarget) {
            this.method = iMethod.toUpperCase();

            //  <script />, JSONP
            if (this.method == 'GET') {
                this.responseURL = iTarget;
                return;
            }

            //  <iframe />
            var iDHR = this,  $_Form = $(iTarget);

            var $_Button = $_Form.find(':button').attr('disabled', true),
                iTarget = $_Form.attr('target');
            if ((! iTarget)  ||  iTarget.match(/^_(top|parent|self|blank)$/i)) {
                iTarget = $.guid('iframe');
                $_Form.attr('target', iTarget);
            }

            $('iframe[name="' + iTarget + '"]').sandBox(function () {
                $(this).on('load',  function () {
                    $_Button.prop('disabled', false);

                    if (iDHR.readyState)  try {
                        var $_Content = $(this).contents();
                        iDHR.responseText = $_Content.find('body').text();
                        iDHR.status = 200;
                        iDHR.readyState = 4;
                        iDHR.onready.call($_Form[0],  iDHR.responseAny(),  $_Content);
                    } catch (iError) { }
                });
            }).attr('name', iTarget);

            this.$_DOM = $_Form;
            this.requestArgs = arguments;
        },
        send:                function () {
            if (this.method == 'POST')
                this.$_DOM.submit();    //  <iframe />
            else {
                //  <script />, JSONP
                var iURL = this.responseURL.match(/([^\?=&]+\?|\?)?(\w.+)?/);
                if (! iURL)  throw 'Illegal URL !';

                var _GUID_ = $.guid(),  iDHR = this;

                BOM.DOMHttpRequest.JSONP[_GUID_] = function () {
                    if (iDHR.readyState) {
                        iDHR.status = 200;
                        iDHR.readyState = 4;
                        iDHR.onready.apply(iDHR, arguments);
                    }
                    delete this[_GUID_];
                    iDHR.$_DOM.remove();
                };
                this.requestData = arguments[0];
                this.responseURL = iURL[1] + $.param(
                    $.extend({ }, arguments[0], $.paramJSON(
                        iURL[2].replace(/(\w+)=\?/,  '$1=DOMHttpRequest.JSONP.' + _GUID_)
                    ))
                );
                this.$_DOM = $('<script />', {src:  this.responseURL}).appendTo(DOM.head);
            }
            this.readyState = 1;
        },
        setRequestHeader:    function () {
            console.warn("JSONP/iframe doesn't support Changing HTTP Headers...");
        },
        abort:               function () {
            this.readyState = 0;
        }
    });

    /* ----- HTTP Wraped Method ----- */
    function iHTTP(iMethod, iURL, iData, iCallback) {
        var iXHR = BOM[
                (X_Domain(iURL) && ($.browser.msie < 10))  ?  'XDomainRequest' : 'XMLHttpRequest'
            ];

        if ($.type(iData) == 'HTMLElement') {
            var $_Form = $(iData);
            iData = { };

            if ($_Form[0].tagName.toLowerCase() == 'form') {
                if (! $_Form.find('input[type="file"]').length)
                    iData = $_Form.serializeArray();
                else if (! ($.browser.msie < 10))
                    iData = new FormData($_Form[0]);
                else
                    iXHR = BOM.DOMHttpRequest;
            }
        }
        if ((iData instanceof Array)  ||  $.isPlainObject(iData))
            iData = $.param(iData);

        iXHR = new iXHR();
        iXHR.onready = iCallback;
        iXHR.open(
            iMethod,
            ((! iData) && $_Form)  ?  $_Form  :  iURL,
            true
        );
        iXHR.withCredentials = true;
        if (typeof iData == 'string')
            iXHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        iXHR.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        iXHR.setRequestHeader('Accept', '*/*');
        iXHR.send(iData);

        return iXHR;
    }

    function Idempotent_Args(iURL) {
        iURL = iURL.split('?');
        iURL[1] = $.extend(
            iURL[1] ? $.paramJSON(iURL[1]) : { },  arguments[1]
        );

        var iPrefetch;
        $('link[rel="next"], link[rel="prefetch"]').each(function () {
            if ($.fileName(this.href) == $.fileName(iURL[0]))
                iPrefetch = true;
        });
        if (! iPrefetch)  iURL[1]._ = $.now();

        return  (iURL[0] + '?' + $.param(iURL[1])).trim('?');
    }

    $.extend({
        get:         function (iURL, iData, iCallback) {
            if (typeof iData == 'function') {
                iCallback = iData;
                iData = { };
            }
            //  XHR
            if (! iURL.match(/\w+=\?/))
                return  iHTTP('GET',  Idempotent_Args(iURL, iData),  null,  iCallback);

            //  JSONP
            var iDHR = new BOM.DOMHttpRequest();
            iDHR.open('GET', iURL);
            iDHR.onready = iCallback;
            return iDHR.send(iData);
        },
        post:        function () {
            var iArgs = $.makeArray(arguments);
            iArgs.unshift('POST');

            return  iHTTP.apply(BOM, iArgs);
        },
        'delete':    function (iURL, iData, iCallback) {
            if (typeof iData == 'function') {
                iCallback = iData;
                iData = { };
            }
            return  iHTTP('DELETE',  Idempotent_Args(iURL, iData),  null,  iCallback);
        },
        put:         function () {
            var iArgs = $.makeArray(arguments);
            iArgs.unshift('PUT');

            return  iHTTP.apply(BOM, iArgs);
        }
    });

    $.getJSON = $.get;

    /* ----- Smart HTML Loading ----- */
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
            if (typeof iHTML != 'string')  return;

            if (! iHTML.match(/<\s*(html|head|body)(\s|>)/i)) {
                Append_Back.apply(this, arguments);
                return;
            }

            var _Context_ = [this, $.makeArray(arguments)];

            $(DOM.body).sandBox(iHTML,  iURL[1],  function ($_innerDOM) {
                _Context_[1].splice(0, 1, $_innerDOM);

                Append_Back.apply(_Context_[0], _Context_[1]);

                $(this).remove();
            });
        }

        if (! iData)
            $.get(iURL[0], Load_Back);
        else
            $.post(iURL[0], iData, Load_Back);

        return this;
    };

    /* ----- Form Element AJAX Submit ----- */
    $.fn.ajaxSubmit = function (iCallback) {
        if (! this.length)  return this;

        var $_Form = (
                (this[0].tagName.toLowerCase() == 'form') ?
                    this : this.find('form')
            ).eq(0);
        if (! $_Form.length)  return this;

        var $_Button = $_Form.find(':button').attr('disabled', true);

        function AJAX_Ready() {
            $_Button.prop('disabled', false);
            iCallback.call($_Form[0], arguments[0]);
        }

        $_Form.on('submit',  function (iEvent) {
            iEvent.preventDefault();
            iEvent.stopPropagation();
            $_Button.attr('disabled', true);

            var iMethod = ($(this).attr('method') || 'Get').toLowerCase();

            if ( this.checkValidity() )  switch (iMethod) {
                case 'get':       ;
                case 'delete':
                    $[iMethod](this.action, AJAX_Ready);    break;
                case 'post':      ;
                case 'put':
                    $[iMethod](this.action, this, AJAX_Ready);
            } else
                $_Button.prop('disabled', false);
        });
        $_Button.prop('disabled', false);

        return this;
    };

})(self, self.document, self.iQuery);



/* ---------- HTML 5 Form Shim ---------- */
(function ($) {

    if ($.browser.modern && (! $.browser.ios))  return;

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

})(self.iQuery);



/* ---------- Other Extension ---------- */
(function (BOM, DOM, $) {

    /* ----- Hash Algorithm (Crypto API Wrapper) ----- */
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

    /* ----- Page URL of a DOM ----- */
    $.fn.pagePath = function () {
        var _PP = this[0].baseURI || this[0].ownerDocument.URL;
        _PP = _PP.split('/');
        if (_PP.length > 3) _PP.pop();
        _PP.push('');
        return _PP.join('/');
    };

})(self, self.document, self.iQuery);