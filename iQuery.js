/* ---------- ECMAScript 5  Patch ---------- */
(function (BOM) {

    BOM.iRegExp = function (iString, Special_Char, Mode) {
        var iChar = ['/', '.'];
        if (Special_Char instanceof Array)
            iChar = iChar.concat(Special_Char);
        var iRegExp_Compiled = / /;

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

    if ( BOM.navigator.userAgent.match(/Gecko/) )
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

})(self);


// ---------->  iQuery.js  <---------- //
(function (BOM, DOM) {
    
/* ---------- Inner Members ---------- */
    var UA = navigator.userAgent;
    var is_Trident = UA.match(/MSIE (\d+)|Trident[^\)]+rv:(\d+)/i),
        is_Gecko = UA.match(/; rv:(\d+)[^\/]+Gecko\/\d+/),
        is_Webkit = UA.match(/Webkit/i);
    var IE_Ver = is_Trident ? Number(is_Trident[1] || is_Trident[2]) : NaN,
        FF_Ver = is_Gecko ? Number(is_Gecko[1]) : NaN;
    var old_IE = IE_Ver && (IE_Ver < 9),
        is_Pad = UA.match(/Tablet|Pad|Book|Android 3/i),
        is_Phone = UA.match(/Phone|Touch|Android 2|Symbian/i);
    var is_Mobile = (
            is_Pad || is_Phone || UA.match(/Mobile/i)
        ) && (! UA.match(/ PC /));

    function _Extend_(iTarget, iSource) {
        iTarget = iTarget || { };

        for (var iKey in iSource)
            if ( iSource.hasOwnProperty(iKey) )
                iTarget[iKey] = iSource[iKey];

        return iTarget;
    }

    var _Browser_ = {
            msie:             IE_Ver,
            ff:               FF_Ver,
            modern:           !  old_IE,
            mobile:           !! is_Mobile,
            pad:              !! is_Pad,
            phone:            !! is_Phone,
            versionNumber:    IE_Ver || FF_Ver
        },
        BOM_Type = {
            'Window':       true,
            'DOMWindow':    true,
            'global':       true
        },
        DOM_Type = {
            sets:    {
                HTMLCollection:    true,
                NodeList:          true,
                jQuery:            true,
                iQuery:            true
            },
            element:    {
                Document:    true,
                Element:     true,
                Window:      true
            }
        };
    _Extend_(DOM_Type.element, (function () {
        var iType = { },  _Name_;

        for (var iVar in BOM) {
            _Name_ = iVar.match(/HTML(\w+?Element)$/);
            if (_Name_)
                iType[_Name_[1]] = true;
        }

        return iType;
    })());

    function _Type_(iVar) {
        var iType = Object.prototype.toString.call(iVar)
                        .split(' ')[1].slice(0, -1);

        if (iVar)
            if (
                BOM_Type[iType] ||
                ((iVar == iVar.document) && (iVar.document != iVar))
            )
                return 'Window';
            else if (iVar.defaultView || iVar.documentElement)
                return 'Document';

        return iType.replace(/HTML(\w+?Element)$/, '$1');
    }

    /* ----- DOM Style ----- */
    var IE_CSS_Filter = (_Browser_.msie < 9);

    function Get_Style(iElement, iName) {
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

        if (_Type_(iStyle) == 'Number')
            return iStyle;

        var iNumber = iStyle.match(/(\d+(\.\d+)?)(px$)?/i);
        iNumber = iNumber ? Number(iNumber[1]) : NaN;

        return  isNaN(iNumber) ? iStyle : (iNumber / iScale);
    }

    var PX_Needed = {
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
        Code_Indent = (! IE_CSS_Filter) ? '' : ' '.repeat(4);

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

    function Set_Style(iElement, iName, iValue) {
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

        if ((! isNaN( Number(iValue) )) && PX_Needed[iName])
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

    function _Style_(iElement, iName, iValue) {
        if (typeof iValue == 'undefined') {
            if (_Type_(iName) == 'String')
                return Get_Style(iElement, iName);
            else if (_Type_(iName.length) == 'Number') {
                var iStyle = { };
                for (var i = 0; i < iName.length; i++)
                    iStyle[iName[i]] = Get_Style(iElement, iName[i]);
                return iStyle;
            } else if (_Type_(iName) == 'Object')
                for (var iKey in iName)
                    Set_Style(iElement, iKey, iName[iKey]);
        } else
            Set_Style(iElement, iName, iValue);
    }

    /* ----- DOM Event ----- */
    var _Time_ = {
        _Root_:    BOM,
        now:       Date.now,
        every:     function (iSecond, iCallback) {
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
        wait:      function (iSecond, iCallback) {
            return  this.every(iSecond, function () {
                iCallback.apply(this, arguments);
                return false;
            });
        }
    };

    function Event_Bind(iElement, iType, iCallback) {
        var CB_Fix,
            This_DOM = (_Type_(iElement) == 'Document') ?
                iElement : (iElement.ownerDocument || iElement.document);
        if (iType == 'DOMContentLoaded') {
            CB_Fix = function () {
                This_DOM.isReady = true;
                iCallback.call(This_DOM,  arguments[0] || BOM.event);
            };
            if (This_DOM && This_DOM.isReady) {
                CB_Fix();
                return;
            }
        } else  iType = iType.toLowerCase();

        if (BOM.UA.Modern) {
            iElement.addEventListener(iType, CB_Fix || iCallback, false);
            return iElement;
        }
        //  IE 8- 事件补丁
        if (iType == 'DOMContentLoaded') {
            if (BOM !== BOM.top)  iType = 'load';
            else {
                _Time_.every(0.01, function () {
                    try {
                        This_DOM.documentElement.doScroll('left');
                        CB_Fix();
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
        iElement.attachEvent('on' + iType, function () {
            if (
                (iType == 'readystatechange') &&
                (! iElement.readyState.match(/loaded|complete/))
            )
                return;

            iCallback.call(iElement, _Extend_(BOM.event, {
                target:           BOM.event.srcElement,
                which:            (iType.slice(0, 3) == 'key') ?
                    BOM.event.keyCode  :  [0, 1, 3, 0, 2, 0, 0, 0][BOM.event.button],
                relatedTarget:    ({
                    mouseover:     BOM.event.fromElement,
                    mouseout:      BOM.event.toElement,
                    mouseenter:    BOM.event.fromElement || BOM.event.toElement,
                    mouseleave:    BOM.event.toElement || BOM.event.fromElement
                })[iType]
            }));
        });
        return iElement;
    }

    function DOM_Create(TagName, AttrList) {
        var iNew;

        if (TagName[0] == '<') {
            iNew = DOM.createElement('div');
            iNew.innerHTML = TagName;
            return (iNew.childNodes.length == 1) ?
                iNew.childNodes[0] : iNew.childNodes;
        }
        iNew = DOM.createElement(TagName);

        if (AttrList)  for (var AK in AttrList) {
            var iValue = AttrList[AK];
            try {
                switch (AK) {
                    case 'class':    if (! _Browser_.modern)
                        iNew.className = iValue;  break;
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
                            iNew.setAttribute(AK, iValue);
                        else
                            Event_Bind(iNew, AK.slice(2), iValue);
                    }
                }
            } catch (iError) { }
        }

        return iNew;
    }


/* ---------- jQuery API ---------- */
    BOM.iQuery = function () {
        /* ----- Global Wrapper ----- */
        var _Self_ = arguments.callee;
        var iArgs = _Extend_([ ], arguments);

        if (! (this instanceof _Self_))
            return  new _Self_(iArgs[0], iArgs[1]);

        /* ----- Constructor ----- */
        this.length = 0;

        if (_Type_(iArgs[0]) == 'String') {
            if ((iArgs[0][0] != '<') && (_Type_(iArgs[1]) != 'Object')) {
                this.context = iArgs[1] || DOM;
                this.add(
                    this.context.querySelectorAll(iArgs[0])
                );
                this.selector = iArgs[0];
            } else
                this.add( DOM_Create(iArgs[0], iArgs[1]) );
        } else
            this.add( iArgs[0] );
    };

    BOM.$ = BOM.iQuery;
    BOM.$.fn = BOM.$.prototype;

    _Extend_(BOM.$, {
        browser:      _Browser_,
        type:         _Type_,
        extend:       _Extend_,
        makeArray:    function () {
            return  this.extend([ ], arguments[0]);
        },
        each:         function (ArrObj) {
            for (var i = 0, iReturn;  i < ArrObj.length;  i++) {
                iReturn = arguments[1].call(ArrObj[i], i, ArrObj[i]);
                if ((this.type(iReturn) != 'Undefined') && (! iReturn))
                    break;
            }
        },
        now:          _Time_.now,
        contains:     function (iParent, iChild) {
            if (! iChild)  return false;

            if ($.browser.modern)
                return  !!(iParent.compareDocumentPosition(iChild) & 16);
            else
                return  (iParent !== iChild) && iParent.contains(iChild);
        },
        trim:         function () {
            return  arguments[0].trim();
        }
    });

    _Extend_(BOM.$.fn, {
        add:     function () {
            var iArgs = BOM.iQuery.makeArray(arguments);
            var iArgType = BOM.iQuery.type(iArgs[0]);

            if (iArgType in DOM_Type.sets)
                for (var i = 0;  i < iArgs[0].length;  i++)
                    [ ].push.call(this, iArgs[0][i]);
            else if (
                (iArgs[0] instanceof HTMLElement) ||
                (iArgType in DOM_Type.element)
            )
                [ ].push.call(this, iArgs[0]);

            return this;
        },
        each:    function () {
            BOM.iQuery.each(this, arguments[0]);

            return this;
        },
        css:     function (iName, iValue) {
            return  this.each(function () {
                    _Style_(this, iName, iValue);
                });
        },
        bind:    function (iType, iCallback) {
            return  this.each(function () {
                    Event_Bind(this, iType, iCallback);
                });
        },
        ready:    function () {
            if (BOM.iQuery.type(this[0]) == 'Document')
                return  this.bind('DOMContentLoaded', arguments[0]);

            throw 'The Ready Method is only used for Document Object !';
        },
        hover:    function (iElement, iEnter, iLeave) {
            this.bind('mouseover', function () {
                if ( BOM.iQuery.contains(this, arguments[0].relatedTarget) )
                    return false;
                iEnter.apply(this, arguments);
            });
            this.bind('mouseout', function () {
                if ( BOM.iQuery.contains(this, arguments[0].relatedTarget) )
                    return false;
                (iLeave || iEnter).apply(this, arguments);
            });

            return iElement;
        },
        appendTo:    function (iTarget) {
            iTarget = BOM.iQuery(iTarget)[0];

            return  this.each(function () {
                    iTarget.appendChild(this);
                });
        },
        text:        function (iText) {
            return  this.each(function () {
                    this.innerText = iText;
                });
        }
    });


/* ---------- jQuery+ v1.1 ---------- */

    /* ----- CSS 规则添加  v0.5 ----- */

    var Code_Indent = (! IE_CSS_Filter) ? '' : ' '.repeat(4);

    function CSS_Rule2Text(iRule) {
        var Rule_Text = [''],  Rule_Block,  _Rule_Block_;

        for (var iSelector in iRule) {
            Rule_Block = iSelector + ' {';
            _Rule_Block_ = [ ];

            for (var iAttribute in iRule[iSelector])
                _Rule_Block_.push(
                    Set_Style(null, iAttribute, iRule[iSelector][iAttribute])
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
            var $_Style = this('<style />', {
                    type:       'text/css',
                    'class':    'jQuery_CSS-Rule'
                });
            if (IE_CSS_Filter)
                $_Style[0].styleSheet.cssText = CSS_Text;
            else  $_Style.text(CSS_Text);

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

})(self, self.document);