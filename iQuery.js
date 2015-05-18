//
//                >>>  iQuery.js  <<<
//
//
//      [Version]    v1.0  (2015-5-18)  Stable
//
//      [Usage]      A Light-weight jQuery Compatible API
//                   with IE 8+ compatibility.
//
//
//            (C)2015    shiy2008@gmail.com
//


/* ---------- Debug Module ---------- */
if (! console) {
    function _Notice_() {
        var iString = [ ];

        for (var i = 0;  i < arguments;  i++)
            iString.push( arguments[i].toString() );

        self.status = iString.join(' ');
    }
    var console = {
            log:      _Notice_,
            info:     _Notice_,
            warn:     _Notice_,
            error:    _Notice_
        };
}
self.onerror = function () {
    this.alert([
        arguments[0],
        arguments[1],
        'Line:  ' + arguments[2]
    ].join("\n\n"));

    this.prompt('[Debug]', this.navigator.userAgent);

    return true;
};


/* ---------- ECMAScript 5  Patch ---------- */
(function (BOM) {

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

    if (! ''.trim) {
        var Blank_Char = BOM.iRegExp('(^\\s*)|(\\s*$)', 'g');

        String.prototype.trim = function () {
            return this.replace(Blank_Char, '');
        };
    }
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

    if ( BOM.navigator.userAgent.match(/; rv:(\d+)[^\/]+Gecko\/\d+/) )
        Object.defineProperty(HTMLElement, 'innerText', {
            set:    function (iText) {
                this.textContent = iText;
            },
            get:    function () {
                var TextRange = this.ownerDocument.createRange();
                TextRange.selectNodeContents(this);
                return TextRange.toString();
            }
        });

//  JSON.format()  v0.3
    var iValue;

    function JSON_ValueOut(iObject) {
        var This_Func = arguments.callee;
        var Recursive = (This_Func === This_Func.caller),
            iStruct;
        if (! Recursive)  iValue = [ ];

        if (iObject instanceof Array) {
            iStruct = [ ];
            for (var i = 0; i < iObject.length; i++)
                iStruct.push(
                    This_Func(iObject[i])
                );
        } else if ((!! iObject) && (typeof iObject == 'object')) {
            iStruct = { };
            for (var iKey in iObject) {
                if ((iKey == 'toString') && (typeof iObject[iKey] == 'function'))
                    continue;
                iStruct[iKey] = This_Func(iObject[iKey]);
            }
        } else {
            iStruct = '';
            iValue.push(iObject);
        }

        if (Recursive)
            return iStruct;
        else
            return [iStruct, iValue];
    }

    function JSON_ValueIn(iString, iValue) {
        for (var i = 0; i < iValue.length; i++) {
            if (typeof iValue[i] == 'string')
                iValue[i] = iValue[i].replace(/"/g, "\\\"");
            iString = iString.replace('""', '"' + iValue[i] + '"');
        }
        return iString;
    }

    BOM.JSON.format = function (iJSON) {
        iJSON = JSON_ValueOut(iJSON);
        iJSON[0] = JSON.stringify(iJSON[0]);

        var iStart = {'"': 0,  '[': 0,  '{': 0},
            iEnd = {']': 0,  '}': 0};

        for (var i = 0, iLevel = 0, Indent; i < iJSON[0].length; i++) {
            switch (iJSON[0][i]) {
                case '{':    ;
                case '[':    {
                    if (! (iJSON[0][i + 1] in iStart)) continue;
                    iLevel++ ;
                }  break;
                case ',':    break;
                case '"':    if (iJSON[0][i + 1] == ':') {
                    iJSON[0] = iJSON[0].slice(0, ++i + 1) + '    ' + iJSON[0].slice(i + 1);
                    i += 4;
                    continue;
                }
                case ']':    ;
                case '}':    {
                    if (! (iJSON[0][i + 1] in iEnd)) continue;
                    iLevel-- ;
                }  break;
                case "\\":    {
                    i++;  continue;
                }  break; 
                default:     continue;
            }
            if (iLevel < 0) try {
                debug();
            } catch (iError) {
                break;
            }
            Indent = "\n" + '    '.repeat(iLevel);
            iJSON[0] = iJSON[0].slice(0, i + 1) + Indent + iJSON[0].slice(i + 1);
            i += Indent.length;
        }
        return JSON_ValueIn(iJSON[0], iJSON[1]);
    };

    BOM.new_Window_Fix = function (Fix_More) {
        if (! this)  return false;

        var _Window_ = this.opener,
            This_DOM = this.document;

        try {
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
        is_Webkit = UA.match(/Webkit/i);
    var IE_Ver = is_Trident ? Number(is_Trident[1] || is_Trident[2]) : NaN,
        FF_Ver = is_Gecko ? Number(is_Gecko[1]) : NaN;
    var is_Pad = UA.match(/Tablet|Pad|Book|Android 3/i),
        is_Phone = UA.match(/Phone|Touch|Android 2|Symbian/i);
    var is_Mobile = (
            is_Pad || is_Phone || UA.match(/Mobile/i)
        ) && (! UA.match(/ PC /));
    var is_iOS = is_Mobile && UA.match(/iTouch|iPhone|iPad|iWatch; CPU[^\)]+OS (\d)_/i),
        is_Android = UA.match(/(Android |Silk\/)(\d+\.\d+)/i);

    var _Browser_ = {
            msie:             IE_Ver,
            ff:               FF_Ver,
            modern:           !  (IE_Ver < 9),
            mobile:           !! is_Mobile,
            pad:              !! is_Pad,
            phone:            !! is_Phone,
            ios:              is_iOS && is_iOS[1],
            android:          is_Android && is_Android[2],
            versionNumber:    IE_Ver || FF_Ver
        };


/* ----- Object Base ----- */
    function _Extend_(iTarget, iSource) {
        iTarget = iTarget || { };

        for (var iKey in iSource)
            if ( Object.prototype.hasOwnProperty.call(iSource, iKey) )
                iTarget[iKey] = iSource[iKey];

        return iTarget;
    }

    var Type_Info = {
            Data:         {
                String:     true,
                Number:     true,
                Boolean:    true,
                Object:     true,
                Null:       true
            },
            BOM:          {
                'Window':       true,
                'DOMWindow':    true,
                'global':       true
            },
            DOM:          {
                set:        {
                    Array:             true,
                    HTMLCollection:    true,
                    NodeList:          true,
                    jQuery:            true,
                    iQuery:            true
                },
                element:    {
                    Document:    true,
                    Element:     true,
                    Window:      true
                },
                root:       {
                    Document:    true,
                    Window:      true
                },
                button:     {
                    button:    true,
                    submit:    true,
                    reset:     true
                }
            },
            DOM_Event:    [
                'load',  'abort',  'error',
                'keydown',  'keypress',  'keyup',
                'mousedown',  'mouseup',  'mousemove',
                'mouseover',  'mouseout',  'mouseenter',  'mouseleave',
                'click',  'dblclick',  'scroll',  'mousewheel',
                'select',  'focus',  'blur',  'change',  'submit',  'reset',
                'DOMContentLoaded'
            ],
            Float:        {
                absolute:    true,
                fixed:       true
            }
        };
    _Extend_(Type_Info.DOM.element, (function () {
        var iType = { },  _Name_;

        for (var iVar in BOM) {
            _Name_ = iVar.match(/HTML(\w+?Element)$/);
            if (_Name_)
                iType[_Name_[1]] = true;
        }

        return iType;
    })());

    function _Type_(iVar) {
        var iType = typeof iVar;
        if (iType == 'object')
            iType = Object.prototype.toString.call(iVar)
                        .split(' ')[1].slice(0, -1);
        else
            iType = iType[0].toUpperCase() + iType.slice(1);

        if (iVar) {
            if (
                Type_Info.BOM[iType] ||
                ((iVar == iVar.document) && (iVar.document != iVar))
            )
                return 'Window';
            else if (iVar.defaultView || iVar.documentElement)
                return 'Document';
            else if (
                iType.match(/HTML\w+?Element$/) ||
                (typeof iVar.tagName == 'string')
            )
                return 'Element';
            else if (
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
        } else if (isNaN(iVar) && (iVar !== iVar))
            return 'NaN';

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


/* ----- DOM Info Operator - Get first, set all. ----- */
    var _Get_Set_ = { };

    function _Operator_(iType, iElement, iName, iValue) {
        var iResult;

        if (! iName) {
            for (var i = 0;  i < iElement.length;  i++)
                _Get_Set_[iType].clear(iElement[i]);
        } else if (_Type_(iValue) == 'Undefined') {
            if (_Type_(iName) == 'String')
                return  _Get_Set_[iType].get(iElement[0], iName);
            else if (_Type_(iName.length) == 'Number') {
                var iData = { };
                for (var i = 0;  i < iName.length;  i++)
                    iData[iName[i]] = _Get_Set_[iType].get(iElement[0], iName[i]);
                return iData;
            } else if (_Type_(iName) == 'Object')
                for (var i = 0;  i < iElement.length;  i++)
                    for (var iKey in iName)
                        iResult = _Get_Set_[iType].set(iElement[i], iKey, iName[iKey]);
        } else
            for (var i = 0;  i < iElement.length;  i++)
                iResult = _Get_Set_[iType].set(iElement[i], iName, iValue);

        return iResult;
    }


    /* ----- DOM Style ----- */
    var IE_CSS_Filter = (_Browser_.msie < 9);
    var Code_Indent = (! IE_CSS_Filter) ? '' : ' '.repeat(4);

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
        PX_Needed:    {
            width:              true,
            'min-width':        true,
            'max-width':        true,
            height:             true,
            'min-height':       true,
            'max-height':       true,
            'border-radius':    true,
            margin:             true,
            padding:            true,
            top:                true,
            left:               true
        },
        get:          function (iElement, iName) {
            if (_Type_(iElement) in Type_Info.DOM.root)  return null;

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

            var iNumber = iStyle.match(/(\d+(\.\d+)?)(px$)?/i);
            iNumber = iNumber ? Number(iNumber[1]) : NaN;

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

            if ((! isNaN( Number(iValue) )) && this.PX_Needed[iName])
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

    var inVisible = {
            display:       'none',
            visibility:    'hidden',
            width:         0
        };

    function is_Visible(iElement) {
        var iStyle = _Operator_('Style', [iElement], [
                'display',  'visibility',  'width'
            ]);

        for (var iKey in iStyle)
            if (iStyle[iKey] == inVisible[iKey])
                return false;
        return true;
    }


    /* ----- DOM Attribute ----- */
    _Get_Set_.Attribute = {
        alias:    {
            'class':    'className',
            'for':      'htmlFor'
        },
        get:      function (iElement, iName) {
            return  (_Type_(iElement) in Type_Info.DOM.root) ?
                null : iElement.getAttribute(_Browser_.modern ? iName : this.AttrName[iName]);
        },
        set:      function (iElement, iName, iValue) {
            if (_Type_(iElement) in Type_Info.DOM.root)
                return false;

            if ((! _Browser_.modern) && this.alias[iName])
                iElement[ this.alias[iName] ] = iValue;
            else
                iElement.setAttribute(iName, iValue);
        }
    };

    /* ----- DOM Data ----- */
    _Get_Set_.Data = {
        _Data_:    [ ],
        _Name_:    { },
        set:       function (iElement, iName, iValue) {
            if (_Type_(iElement.dataIndex) != 'Number')
                iElement.dataIndex = this._Data_.push({ }) - 1;

            this._Data_[iElement.dataIndex][iName] = iValue;
        },
        get:       function (iElement, iName) {
            if (_Type_(iElement.dataIndex) != 'Number')
                iElement.dataIndex = this._Data_.push({ }) - 1;

            var iData = this._Data_[iElement.dataIndex][iName];

            if (iData)
                return iData;
            else  try {
                return  _Operator_('Attribute', [iElement],  'data-' + iName);
            } catch (iError) {
                return null;
            }
        },
        clear:     function (iElement) {
            if (_Type_(iElement.dataIndex) == 'Number')
                this._Data_[iElement.dataIndex] = null;
        },
        clone:     function (iOld, iNew) {
            iNew.dataIndex = this._Data_.push({ }) - 1;
            _Extend_(this._Data_[iNew.dataIndex], this._Data_[iOld.dataIndex]);
        }
    };

/* ----- DOM Event ----- */
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
            _Timer_:    { },
            start:      function () {
                return  this._Timer_[arguments[0]] = this.now();
            },
            end:        function () {
                return  (this.now() - this._Timer_[arguments[0]]) / 1000;
            }
        };

    var _Event_ = _Browser_.modern ? {
            bind:    function () {
                arguments[0].addEventListener(arguments[1], arguments[2], false);
            },
            trig:    function () {
                var iEvent = DOM.createEvent('HTMLEvents');
                iEvent.initEvent(arguments[1], true, true);
                arguments[0].dispatchEvent(iEvent);
            }
        } : {
            bind:    function (iElement, iType, iCallback) {
                var This_DOM = (_Type_(iElement) == 'Document') ?
                        iElement : (iElement.ownerDocument || iElement.document);

                //  Custom DOM Event
                if (Type_Info.DOM_Event.indexOf(iType) == -1) {
                    if (! _Operator_('Data', [iElement], 'custom-event')) {
                        _Operator_('Data', [iElement], 'custom-event', true);
                        iType = 'propertychange';
                    } else  iType = '';

                    if (! _Operator_('Attribute',  [iElement],  'on' + iType))
                        _Operator_('Attribute',  [iElement],  'on' + iType,  _Time_.now());
                }

                //  Patch to W3C DOM Event
                if (iType == 'DOMContentLoaded') {
                    if (BOM !== BOM.top)  iType = 'load';
                    else {
                        _Time_.every(0.01, function () {
                            try {
                                This_DOM.documentElement.doScroll('left');
                                iCallback.call(This_DOM, BOM.event);
                                return false;
                            } catch (Err) {
                                return;
                            }
                        });
                        return iElement;
                    }
                }
                if ((_Type_(iElement) != 'Window') && (iType == 'load'))
                    iType = 'readystatechange';

                if (! iType)  return;

                iElement.attachEvent('on' + iType, function () {
                    var iEvent = _Extend_(
                            new (function HTMLEvent () {})(),
                            BOM.event
                        ),
                        Loaded;

                    switch (iEvent.type) {
                        case 'readystatechange':    
                            Loaded = iElement.readyState.match(/loaded|complete/);  break;
                        case 'load':
                            Loaded = (iElement.readyState == 'loaded');  break;
                        case 'propertychange':
                            if ( _Operator_('Data', [iElement], 'custom-event') )
                                iEvent.type = iEvent.propertyName.replace(/^on/i, '').toLowerCase();
                        default:
                            Loaded = true;
                    }
                    if (! Loaded)  return;

                    iCallback.call(iElement, _Extend_(iEvent, {
                        target:           iEvent.srcElement,
                        which:            (iEvent.type.slice(0, 3) == 'key') ?
                            iEvent.keyCode  :  [0, 1, 3, 0, 2, 0, 0, 0][iEvent.button],
                        relatedTarget:    ({
                            mouseover:     iEvent.fromElement,
                            mouseout:      iEvent.toElement,
                            mouseenter:    iEvent.fromElement || iEvent.toElement,
                            mouseleave:    iEvent.toElement || iEvent.fromElement
                        })[iEvent.type]
                    }));
                });
            },
            trig:    function (iElement, iType) {
                iType = iType.toLowerCase();

                if (Type_Info.DOM_Event.indexOf(iType) > -1) {
                    var iEvent = DOM.createEventObject();
                    iEvent.type = 'on' + iType;
                    iElement.fireEvent(iEvent.type, iEvent);
                } else
                    _Operator_('Attribute',  iElement,  'on' + iType,  _Time_.now());
            }
        };

    _Get_Set_.Data._Name_.event = true;

    function Event_Switch(iElement, iType, iCallback) {
        if (iType.indexOf('DOM') != 0)
            iType = iType.toLowerCase();

        var Event_Data = _Operator_('Data', [iElement], 'event');
        if (! Event_Data)
            Event_Data = { };

        if (! Event_Data[iType]) {
            Event_Data[iType] = [ ];
            _Event_.bind(iElement, iType, function (iEvent) {
                var iHandler = _Operator_('Data', [iElement], 'event')[iEvent.type],
                    iReturn;

                for (var i = 0, _Return_;  i < iHandler.length;  i++) {
                    _Return_ = iHandler[i].apply(this, arguments);
                    if (typeof _Return_ == 'undefined')
                        iReturn = _Return_;
                }

                return iReturn;
            });
        }

        if (iCallback)
            Event_Data[iType].push( iCallback );
        else
            Event_Data[iType] = null;

        _Operator_('Data', [iElement], 'event', Event_Data);
    }


    /* ----- DOM Ready ----- */
    _Operator_('Data', [DOM], 'event', {
        ready:    [ ],
    });
    _Get_Set_.Data._Name_.Ready_Timer = true;
    _Time_.start('DOM_Ready');

    function DOM_Ready_Event() {
        if (DOM.isReady) return;

        var _DOM_Ready_ = (DOM.readyState == 'complete') &&
                DOM.body  &&  DOM.body.lastChild  &&  DOM.getElementById;

        if ((this !== DOM) && (! _DOM_Ready_))
            return;

        DOM.isReady = true;
        BOM.clearTimeout(
            _Operator_('Data', [DOM], 'Ready_Timer')
        );
        _Operator_('Data', [DOM], 'Load_During', _Time_.end('DOM_Ready'));
        _Operator_('Data', [DOM], 'Ready_Event', arguments[0]);
        console.info('[DOM Ready Event]');
        console.log(this, arguments);

        var iHandler = _Operator_('Data', [DOM], 'event').ready;
        for (var i = 0;  i < iHandler.length;  i++)
            iHandler[i].apply(DOM, arguments);

        return false;
    }

    _Operator_(
        'Data',  [DOM],  'Ready_Timer',  _Time_.every(0.5, DOM_Ready_Event)
    );
    _Event_.bind(DOM, 'DOMContentLoaded', DOM_Ready_Event);
    _Event_.bind(BOM, 'load', DOM_Ready_Event);



/* ----- DOM Constructor ----- */
    function DOM_Create(TagName, AttrList) {
        var iNew;

        if (TagName[0] == '<') {
            if (! TagName.match(/^<style[^\w]+/i)) {
                iNew = DOM.createElement('div');
                iNew.innerHTML = TagName;
                if (iNew.children.length > 1)
                    return iNew.children;
                else
                    iNew = iNew.children[0];
            } else
                TagName = 'style';
        }
        if (! iNew)
            iNew = DOM.createElement(TagName);

        if (AttrList)  for (var AK in AttrList) {
            var iValue = AttrList[AK];
            try {
                switch (AK) {
                    case 'text':     {
                        if (TagName == 'style') {
                            if (! _Browser_.modern)
                                iNew.styleSheet.cssText = iValue;
                            else
                                iNew.appendChild( DOM.createTextNode(iValue) );
                        } else
                            iNew.innerText = iValue;
                    }  break;
                    case 'html':
                        iNew.innerHTML = iValue;  break;
                    case 'style':    if (_Type_(iValue) == 'Object') {
                        _Type_(iNew, iValue);
                        break;
                    }
                    default:         {
                        if (! AK.match(/^on\w+/))
                            _Operator_('Attribute', [iNew], AK, iValue);
                        else
                            _Event_.bind(iNew, AK.slice(2), iValue);
                    }
                }
            } catch (iError) { }
        }

        return iNew;
    }


/* ----- AJAX Module ----- */
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

    function iAJAX(This_Call, X_Domain) {
        var iXDR = (X_Domain && (_Browser_.msie < 10));
        var iXHR = new BOM[iXDR ? 'XDomainRequest' : 'XMLHttpRequest']();

        var _Open_ = iXHR.open;
        iXHR.open = function () {
            var _This_ = this;

            _This_[
                X_Domain ? 'onload' : 'onreadystatechange'
            ] = function () {
                if (! (X_Domain || (_This_.readyState == 4)))  return;

                iXHR.onready.call(iXHR, iXHR.responseAny());
                iXHR = null;
            };
            _Open_.apply(_This_, arguments);
        };
        if (iXDR)
            iXHR.setRequestHeader = function () {
                console.warn("IE 8/9 XDR doesn't support Changing HTTP Headers...");
            };

        return  _Extend_(iXHR, {
                responseAny:    function () {
                    var iResponse = this.responseText.trim();

                    try {
                        iResponse = BOM.JSON.parse(iResponse);
                    } catch (iError) {
                        try {
                            iResponse = XML_Parse(iResponse);
                        } catch (iError) { }
                    }

                    return iResponse;
                },
                timeOut:        function (TimeOut_Seconds, TimeOut_Callback) {
                    var iXHR = this;

                    _Time_.wait(TimeOut_Seconds, function () {
                        iXHR.onreadystatechange = null;
                        iXHR.abort();
                        TimeOut_Callback.call(iXHR);
                    });
                },
                retry:    function (Wait_Seconds) {
                    _Time_.wait(Wait_Seconds, function () {
                        This_Call.callee.apply(BOM, This_Call);
                    });
                }
            });
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
        this.context = DOM;

        if (! iArgs[0]) return;

        if (_Type_(iArgs[0]) == 'String') {
            if ((iArgs[0][0] != '<') && (_Type_(iArgs[1]) != 'Object')) {
                this.context = iArgs[1] || this.context;
                try {
                    this.add(
                        this.context.querySelectorAll(iArgs[0])
                    );
                } catch (iError) { }
                this.selector = iArgs[0];
            } else
                this.add( DOM_Create(iArgs[0], iArgs[1]) );
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
        isPlainObject:    function () {
            return  (arguments[0].constructor === Object);
        },
        isEmptyObject:    function () {
            for (var iKey in arguments[0])
                return false;
            return true;
        },
        extend:           _Extend_,
        makeArray:        function () {
            return  this.extend([ ], arguments[0]);
        },
        inArray:          function () {
            return  [ ].indexOf.call(arguments[0], arguments[1]);
        },
        each:             function (ArrObj) {
            for (var i = 0, iReturn;  i < ArrObj.length;  i++) {
                iReturn = arguments[1].call(ArrObj[i], i, ArrObj[i]);
                if ((this.type(iReturn) != 'Undefined') && (! iReturn))
                    break;
            }
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
            var iParameter = [ ];

            if ( $.isPlainObject(iObject) )
                for (var iName in iObject)
                    if ($.type(iObject[iName]) in Type_Info.Data)
                        iParameter.push(iName + '=' + iObject[iName]);
            else if (iObject instanceof $)
                for (var i = 0;  i < iObject.length;  i++)
                    iParameter.push(iObject[i].name + '=' + iObject[i].value);

            return iParameter.join('&');
        },
        paramJSON:        function (Args_Str) {
            Args_Str = (Args_Str || BOM.location.search).match(/^[^\?]*\?([^\s]+)$/);
            if (! Args_Str)  return { };

            var iArgs = Args_Str[1].split('&'),
                _Args_ = {
                    toString:    function () {
                        return  BOM.JSON.format(this);
                    }
                };

            for (var i = 0, iValue; i < iArgs.length; i++) {
                iArgs[i] = iArgs[i].split('=');

                iValue = BOM.decodeURIComponent(
                    iArgs[i].slice(1).join('=')
                );
                try {
                    iValue = BOM.JSON.parse(iValue);
                } catch (iError) { }

                _Args_[ iArgs[i][0] ] = iValue;
            }

            return  iArgs.length ? _Args_ : { };
        },
        data:             function (iElement, iName, iValue) {
            if (iValue  &&  (iName in _Get_Set_.Data._Name_))
                throw  'Name "' + iName + '" is only for Inner Using !';

            return  _Operator_('Data', [iElement], iName, iValue);
        }
    });

    _Extend_($, _Time_);

    
    
    /* ----- HTTP Client ----- */
    function iHTTP(iURL, iData, iCallback) {
        iURL = iURL.split('?')[0] + '?' + $.param(
            $.extend($.paramJSON(iURL), {_:  $.now()})
        );

        var HTTP_Client = iAJAX(
                arguments,
                iCallback.name || X_Domain(iURL)
            );
        HTTP_Client.onready = iCallback;
        HTTP_Client.open(iData ? 'POST' : 'GET', iURL, true);
//        HTTP_Client.setRequestHeader('If-Modified-Since', 0);
        HTTP_Client.send(
            (typeof iData == 'string') ? iData : BOM.JSON.stringify(JSON)
        );

        return HTTP_Client;
    }

    _Extend_($, {
        get:     function () {
            return  iHTTP(arguments[0], null, arguments[1]);
        },
        post:    function () {
            return  iHTTP(arguments[0], arguments[1], arguments[2]);
        }
    });

    /* ----- iQuery Instance Method ----- */
    _Extend_($.fn, {
        splice:         [ ].splice,
        add:            function () {
            var iArgs = $.makeArray(arguments);
            var iArgType = $.type(iArgs[0]);

            if (iArgType == 'String') {
                iArgs[0] = $(iArgs[0], iArgs[1]);
                iArgType = 'iQuery';
            }
            if (iArgType in Type_Info.DOM.set) {
                for (var i = 0;  i < iArgs[0].length;  i++)
                    if ( iArgs[0][i] )
                        [ ].push.call(this, iArgs[0][i]);
            } else if (iArgType in Type_Info.DOM.element)
                [ ].push.call(this, iArgs[0]);

            return this;
        },
        jquery:         '1.9.1',
        iquery:         '1.0',
        eq:             function () {
            var $_This = this;

            return  $.extend(
                    $( this[arguments[0]] ),
                    {prevObject:  $_This}
                );
        },
        index:          function (iTarget) {
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
        slice:          function () {
            var $_This = this;

            return  $.extend(
                    $( [ ].slice.apply($_This, arguments) ),
                    {prevObject:  $_This}
                );
        },
        each:           function () {
            $.each(this, arguments[0]);

            return this;
        },
        is:             function (iSelector) {
            return  (
                    $.inArray(
                        $(iSelector,  this[0] && this[0].parentNode),
                        this[0]
                    ) > -1
                );
        },
        filter:         function (iSelector) {
            var $_This = this,
                $_Filter = $(iSelector),
                iVisible = iSelector && iSelector.trim().match(/(\s?):visible$/),
                $_Result = [ ];

            if (iVisible)  iVisible = iVisible[1] ? 2 : 1;

            if ( $_Filter.length )
                for (var i = 0;  i < $_This.length;  i++)
                    if ($.inArray($_Filter, $_This[i]) > -1) {
                        if (iVisible && (! is_Visible($_This[i])))
                            continue;
                        $_Result.push( $_This[i] );
                    }

            return  $.extend($($_Result), {prevObject:  $_This});
        },
        attr:           function () {
            var iResult = _Operator_('Attribute', this, arguments[0], arguments[1]);
            return  (typeof iResult == 'undefined') ? this : iResult;
        },
        data:           function () {
            var iResult = _Operator_('Data', this, arguments[0], arguments[1]);
            return  (typeof iResult == 'undefined') ? this : iResult;
        },
        parent:         function () {
            var $_This = this,  $_Result = [ ];

            for (var i = 0;  i < $_This.length;  i++)
                if ($.inArray($_Result, $_This[i].parentNode) == -1)
                    $_Result.push( $_This[i].parentNode );

            $_Result = $($_Result);
            if ( arguments[0] )
                $_Result = $_Result.filter(arguments[0]);

            return  $.extend($_Result, {prevObject:  $_This});
        },
        parents:        function () {
            var $_This = this,  _UID_ = $.now();

            for (var i = 0;  i < $_This.length;  i++)
                $( Back_Track.call($_This[i], 'parentNode') )
                    .data('iQuery', _UID_);

            var $_Result = $('*[iQuery="' + _UID_ + '"]');
            if ( arguments[0] )
                $_Result = $_Result.filter(arguments[0]);

            return  $.extend(
                    [ ].reverse.call($_Result),
                    {prevObject:  $_This}
                );
        },
        children:       function () {
            var $_This = this,  $_Result = [ ];

            for (var i = 0;  i < $_This.length;  i++)
                $_Result = $_Result.concat(
                    $.makeArray( $_This[i].children )
                );

            $_Result = $($_Result);
            if ( arguments[0] )
                $_Result = $_Result.filter(arguments[0]);

            return  $.extend($_Result, {prevObject:  $_This});
        },
        contents:       function () {
            var $_This = this,  $_Result = [ ],
                Type_Filter = parseInt(arguments[0]);

            for (var i = 0;  i < $_This.length;  i++)
                $_Result = $_Result.concat($.makeArray(
                    ($_This[i].tagName.toLowerCase() != 'iframe') ?
                        $_This[i].childNodes : $_This[i].contentWindow.document
                ));

            if ($.type(Type_Filter) == 'Number')
                for (var i = 0;  i < $_Result.length;  i++)
                    if ($_Result[i].nodeType != Type_Filter)
                        $_Result[i] = null;

            return  $.extend($($_Result), {prevObject:  $_This});
        },
        siblings:       function () {
            var _UID_ = $.now();
            var $_This = this.data('iQuery', _UID_);

            var $_Result = this.parent().children();
            for (var i = 0;  i < $_Result.length;  i++)
                if (Get_Attribute($_Result[i], 'iQuery') == _UID_)
                    $_Result[i] = null;

            $_Result = $($_Result);
            if ( arguments[0] )
                $_Result = $_Result.filter(arguments[0]);

            return  $.extend($_Result, {prevObject:  $_This});
        },
        find:           function () {
            var $_This = this,  $_Result = [ ];

            for (var i = 0;  i < $_This.length;  i++)
                $_Result = $_Result.concat( $(arguments[0], $_This[i]) );

            return  $.extend($($_Result), {prevObject:  $_This});
        },
        text:           function (iText) {
            var iResult = [ ];

            for (var i = 0;  i < this.length;  i++)
                if (! iText)
                    iResult.push( this[i].innerText );
                else
                    this[i].innerText = iText;

            return  iResult.length ? iResult.join('') : this;
        },
        html:           function (iHTML) {
            if (! iHTML)  return this[0].innerHTML;

            for (var i = 0;  i < this.length;  i++)
                this[i].innerHTML = iHTML;

            return  this;
        },
        css:            function (iName, iValue) {
            var iResult = _Operator_('Style', this, arguments[0], arguments[1]);
            return  (typeof iResult == 'undefined') ? this : iResult;
        },
        hide:           function () {
            for (var i = 0, $_This;  i < this.length;  i++) {
                $_This = $(this[i]);
                $_This.data('display', $_This.css('display'))
                    .css('display', 'none');
            }
            return this;
        },
        show:           function () {
            for (var i = 0, $_This;  i < this.length;  i++) {
                $_This = $(this[i]);
                $_This.css('display',  $_This.data('display') || 'origin');
            }
            return this;
        },
        width:          function () {
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
        height:         function () {
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
        position:       function () {
            return  {
                    left:    this[0].offsetLeft,
                    top:     this[0].offsetTop
                };
        },
        offset:         function () {
            var iOffset = {
                    left:    this[0].offsetLeft,
                    top:     this[0].offsetTop
                };

            Back_Track.call('offsetParent', function () {
                iOffset.left += this.offsetLeft;
                iOffset.top += this.offsetTop;
            });

            return iOffset;
        },
        addClass:       function (new_Class) {
            new_Class = new_Class.split(' ');

            for (var i = 0, old_Class;  i < this.length;  i++) {
                old_Class = _Operator_('Attribute', [this[i]], 'class') || [ ];
                if (typeof old_Class == 'string')
                    old_Class = old_Class.replace(/\s+/g, ' ').split(' ');
                for (var j = 0;  j < new_Class.length;  j++)
                    if ($.inArray(old_Class, new_Class[j]) == -1)
                        old_Class.push( new_Class[j] );
                _Operator_('Attribute', [this[i]], 'class', old_Class.join(' '));
            }

            return this;
        },
        removeClass:    function (iClass) {
            iClass = BOM.iRegExp(
                '\s+(' + iClass.replace(/\s+/g, '|') + ')\s+',  'g'
            );

            for (var i = 0;  i < this.length;  i++)
                _Operator_('Attribute', 
                    [this[i]],  'class',  _Operator_('Attribute', [this[i]], 'class').replace(iClass, ' ')
                );

            return this;
        },
        hasClass:       function () {
            return  ((' ' + this.attr('class') + ' ').indexOf(' ' + arguments[0] + ' ') > -1);
        },
        bind:           function (iType, iCallback) {
            for (var i = 0;  i < this.length;  i++)
                Event_Switch(this[i], iType, iCallback);

            return  this;
        },
        unbind:         function (iType) {
            for (var i = 0;  i < this.length;  i++)
                Event_Switch(this[i], iType);

            return  this;
        },
        on:             function (iType, iFilter, iCallback) {
            if ($.type(iFilter) != 'String')
                return  this.bind.apply(this, arguments);
            else
                return  this.bind(iType, function () {
                        if ( $(arguments[0].target).is(iFilter) )
                            iCallback.apply(this, arguments);
                    });
        },
        ready:          function (iCallback) {
            if ($.type(this[0]) != 'Document')
                throw 'The Ready Method is only used for Document Object !';

            if (! DOM.isReady) {
                var iEvent = this.data('event');
                iEvent.ready.push(iCallback);
                this.data('event', iEvent);
            } else
                iCallback.call(this[0],  $.data(DOM, 'Ready_Event'));

            return this;
        },
        hover:          function (iEnter, iLeave) {
            return  this.bind('mouseover', function () {
                    if (
                        $.contains(this, arguments[0].relatedTarget) ||
                        ($(arguments[0].target).css('position') in Type_Info.Float)
                    )
                        return false;
                    iEnter.apply(this, arguments);
                }).bind('mouseout', function () {
                    if (
                        $.contains(this, arguments[0].relatedTarget) ||
                        ($(arguments[0].target).css('position') in Type_Info.Float)
                    )
                        return false;
                    (iLeave || iEnter).apply(this, arguments);
                });
        },
        trigger:        function () {
            for (var i = 0;  i < this.length;  i++)
                _Event_.trig(this[i], arguments[0]);

            return this;
        },
        append:         function () {
            var $_Child = $(arguments[0], arguments[1]);

            for (var i = 0;  i < $_Child.length;  i++)
                this[0].appendChild( $_Child[i] );

            return this;
        },
        appendTo:       function () {
            $_Target = $(arguments[0], arguments[1]);

            for (var i = 0;  i < this.length;  i++)
                $_Target[0].appendChild( this[i] );

            return  this;
        },
        before:         function () {
            var $_Brother = $(arguments[0], arguments[1]);

            for (var i = 0;  i < $_Brother.length;  i++)
                this[0].parentNode.insertBefore($_Brother[i], this[0]);

            return this;
        },
        clone:          function (iDeep) {
            var $_This = this,  $_Result = [ ];

            for (var i = 0;  i < $_This.length;  i++) {
                $_Result[i] = $_This[i].cloneNode(iDeep);
                _Get_Set_.Data.clone($_This[i], $_Result[i]);
            }

            return  $.extend($($_Result), {prevObject:  $_This});
        },
        remove:         function () {
            for (var i = 0;  i < this.length;  i++)
                this[i].parentNode.removeChild(this[i]);

            _Operator_('Data', this);

            return this;
        },
        addBack:        function () {
            var $_This = this,
                _UID_ = $.now();

            var $_Result = $(
                    $.makeArray($_This).concat(
                        $.makeArray($_This.prevObject)
                    )
                ).data('iQuery', _UID_);

            return  $.extend(
                    $('*[iQuery="' + _UID_ + '"]'),
                    {prevObject:  $_This}
                );
        },
        val:            function () {
            if (! arguments[0])
                return  this[0].value;
            else
                return  this.attr('value', arguments[0]);
        },
        serializeArray:    function () {
            var $_Value = this.find('*[name]'),
                iValue = [ ];

            for (var i = 0;  i < $_Value.length;  i++)
                if (
                    (! $_Value[i].disabled) ||
                    (! ($_Value[i].type in Type_Info.DOM.button))
                )
                    iValue.push({
                        name:     $_Value[i].name,
                        value:    $_Value[i].value
                    });

            return iValue;
        }
    });

    /* ----- Event ShortCut ----- */
    $.fn.off = $.fn.unbind;

    var no_ShortCut = {
            load:                true,
            DOMContentLoaded:    true,
            mouseover:           true,
            mouseout:            true,
            mouseenter:          true,
            mouseleave:          true,
            mousewheel:          true
        };

    function Event_Method(iName) {
        return  function () {
                if (! arguments[0]) {
                    for (var i = 0;  i < this.length;  i++)  try {
                        this[i][iName]();
                    } catch (iError) {
                        _Event_.trig(this[i], iName);
                    }
                } else
                    this.bind(iName, arguments[0]);

                return this;
            };
    }

    for (var i = 0, iName;  i < Type_Info.DOM_Event.length;  i++) {
        iName = Type_Info.DOM_Event[i];
        if (! (iName in no_ShortCut))
            $.fn[iName] = Event_Method(iName);
    }


/* ---------- jQuery+ v1.2 ---------- */

    /* ----- CSS 规则添加  v0.5 ----- */

    function CSS_Rule2Text(iRule) {
        var Rule_Text = [''],  Rule_Block,  _Rule_Block_;

        for (var iSelector in iRule) {
            Rule_Block = iSelector + ' {';
            _Rule_Block_ = [ ];

            for (var iAttribute in iRule[iSelector])
                _Rule_Block_.push(
                    _Operator_('Style', [null], iAttribute, iRule[iSelector][iAttribute])
                        .replace(/^(\w)/m,  Code_Indent + '$1')
                );

            Rule_Text.push(
                [Rule_Block, _Rule_Block_.join(";\n"), '}'].join("\n")
            );
        }
        Rule_Text.push('');

        return Rule_Text.join("\n");
    }

    $.cssRule = function () {
        var iRule = arguments[arguments.length - 1],
            iMedia = (typeof arguments[0] == 'string') && arguments[0];

        var CSS_Text = CSS_Rule2Text(iRule);
        if (iMedia)  CSS_Text = [
                '@media ' + iMedia + ' {',
                CSS_Text.replace(/\n/m, "\n    "),
                '}'
            ].join("\n");

        this(DOM).ready(function () {
            var $_Style = $('<style />', {
                    type:       'text/css',
                    'class':    'jQuery_CSS-Rule'
                });
            if (IE_CSS_Filter)
                $_Style[0].styleSheet.cssText = CSS_Text;
            else  $_Style.html(CSS_Text);

            $_Style.appendTo('body');
        });
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

    $.fn.PagePath = function () {
        var _PP = this[0].baseURI ? this[0].baseURI : document.URL;
        _PP = _PP.split('/');
        if (_PP.length > 3) _PP.pop();
        _PP.push('');
        return _PP.join('/');
    };

    /* ----- jQuery 元素集合父元素交集  v0.1 ----- */

    $.fn.sameParents = function () {
        if (! this.length)
            throw 'No Element in the jQuery DOM Set...';
        if (this.length == 1) {
            console.warn("The jQuery DOM Set has only one Element:\n\n%o", this);

            return this.parents();
        }
        var $_Min = this.eq(0).parents(),
            $_Larger, $_Root;

        this.each(function () {
            if (! arguments[0]) return;

            var $_Parents = $(this).parents();

            if ($_Parents.length > $_Min.length)
                $_Larger = $_Parents;
            else {
                $_Larger = $_Min;
                $_Min = $_Parents;
            }
        });

        $_Min.each(function (Index) {
            Index -= $_Min.length;

            if (this === $_Larger[$_Larger.length + Index]) {
                $_Root = $_Min.slice(Index);
                return false;
            }
        });

        return  arguments[0] ? $_Root.filter(arguments[0]) : $_Root;
    };

    /* ----- jQuery 元素 z-index 独立方法  v0.2 ----- */

    function Get_zIndex($_DOM) {
        var _zIndex_ = $_DOM.css('z-index');
        if (_zIndex_ != 'auto')  return Number(_zIndex_);

        var $_Parents = $_DOM.parents();
        _zIndex_ = 0;

        $_Parents.each(function () {
            var _Index_ = $(this).css('z-index');

            if (_Index_ == 'auto')  _zIndex_++ ;
            else  _zIndex_ += _Index_;
        });

        return ++_zIndex_;
    }

    function Set_zIndex() {
        var $_This = $(this),  _Index_ = 0;

        $_This.siblings().addBack().each(function () {
            _Index_ = Math.max(_Index_, Get_zIndex( $(this) ));
        });
        $_This.css('z-index', _Index_);
    }

    $.fn.zIndex = function (new_Index) {
        if (! new_Index)
            return  Get_zIndex(this.eq(0));
        else if (new_Index == '+')
            return  this.each(Set_zIndex);
        else
            return  this.css('z-index',  Number(new_Index) || 'auto');
    };

    /* ----- Form 元素 无刷新提交（iframe 版） v0.2 ----- */

    $.fn.post = function () {
        var iArgs = $.makeArray(arguments);
        var $_Form = this.is('form') ? this : this.find('form').eq(0),
            iAttribute = $.isPlainObject(iArgs[0]) ? iArgs.shift() : { },
            iCallback = ($.type(iArgs[0]) == 'Function') ? iArgs.shift() : null;

        var iTarget = $_Form.attr('target'),
            $_iFrame = [ ];
        if (! iTarget) {
            iTarget = 'iFrame_' + $.now();
            $_Form.attr('target', iTarget);
        } else
            $_iFrame = $('iframe[name="' + iTarget + '"]');
        iAttribute = $.extend({
            frameBorder:          0,
            allowTransparency:    true
        }, iAttribute);
        if (! $_iFrame.length)
            $_iFrame = $('<iframe />', $.extend(iAttribute, {name:  iTarget}));
        else {
            var iAttr = { };
            $.each(iAttribute, function (iKey, iValue) {
                if (iKey in $.fn)
                    $_iFrame[iKey](iValue);
                else
                    iAttr[iKey] = iValue;
            });
            $_iFrame.attr(iAttr);
        }
        $_iFrame.appendTo( $_Form.parent() ).on('load', function () {
            try {
                var $_Content = $(this).contents();
                iCallback.call(
                    $_Form[0],  $_Content.find('body').text(),  $_Content
                );
            } catch (iError) { }
        });
        $_Form[0].submit();

        return $_iFrame;
    };

})(self, self.document);


/* ----- DOM/CSS 动画 ----- */
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

        for (var iStyle in CSS_Final)  (function (iName) {
            var iKeyFrame = KeyFrame($_This.css(iName), CSS_Final[iName], During_Second);

            $.every(1 / FPS,  function () {
                if ($_This.data('animate') && iKeyFrame.length)
                    $_This.css(iName, iKeyFrame.shift());
                else {
                    iKeyFrame = null;
                    return false;
                }
            });
        })(iStyle);

        return $_This;
    };

    $.fn.stop = function () {
        return  this.data('animate', 0);
    };

    $.fx = {interval:  1000 / FPS};

})(self.iQuery);