//
//              >>>  jQuery+  <<<
//
//
//    [Version]    v7.1  (2016-05-07)
//
//    [Require]    jQuery  v1.9+
//
//
//        (C)2014-2016  shiy2008@gmail.com
//


/* ---------- ECMAScript API  Patch & Extension ---------- */
(function (BOM, $) {

/* ---------- Object Patch  v0.1 ---------- */

    if (! Object.getOwnPropertyNames)
        Object.getOwnPropertyNames = function (iObject) {
            var iKey = [ ];

            for (var _Key_ in iObject)
                if ( this.prototype.hasOwnProperty.call(iObject, _Key_) )
                    iKey.push(_Key_);

            return iKey;
        };

/* ---------- String Extension  v0.3 ---------- */

    if (! ''.repeat)
        String.prototype.repeat = function (Times) {
            return  (new Array(Times + 1)).join(this);
        };

    $.extend(String.prototype, {
        toCamelCase:     function () {
            var iName = this.split(arguments[0] || '-');

            for (var i = 1;  i < iName.length;  i++)
                iName[i] = iName[i][0].toUpperCase() + iName[i].slice(1);

            return iName.join('');
        },
        toHyphenCase:    function () {
            return  this.replace(/([a-z0-9])[\s_]?([A-Z])/g,  function () {
                return  arguments[1] + '-' + arguments[2].toLowerCase();
            });
        }
    });

/* ---------- Array Patch  v0.1 ---------- */

    if (! [ ].reduce)
        Array.prototype.reduce = function () {
            var iResult = arguments[1];

            for (var i = 1;  i < this.length;  i++) {
                if (i == 1)  iResult = this[0];

                iResult = arguments[0](iResult, this[i], i, this);
            }

            return iResult;
        };

/* ---------- JSON Extension  v0.4 ---------- */

    if (! BOM.JSON)
        BOM.JSON = {
            parse:    function () {
                return  $.parseJSON(arguments[0]);
            }
        };

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

})(self,  self.jQuery || self.Zepto);



/* ---------- iQuery Core  Patch ---------- */
(function (BOM, DOM, $) {

/* ---------- $.browser+  v0.2 ---------- */

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

    $.browser = {
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


/* ---------- 计时器+  v0.3 ---------- */

    var $_BOM = $(BOM).data('_timer_',  { });

    $.extend($, {
        _Root_:    BOM,
        every:     function (iSecond, iCallback) {
            var _BOM_ = this._Root_,
                iTimeOut = (iSecond || 1) * 1000,
                iTimer, iReturn, Index = 0,
                iStart = $.now(), iDuring;

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
        },
        start:     function (iName) {
            var Time_Stamp;

            $_BOM.data('_timer_',  function (_Index_, iTimer) {
                iTimer = iTimer || { };
                Time_Stamp = iTimer[iName] = $.now();
                return iTimer;
            });

            return Time_Stamp;
        },
        end:       function () {
            var iTimer = $_BOM.data('_timer_');
            return  ($.now() - iTimer[arguments[0]]) / 1000;
        },
        uuid:      function () {
            return  [
                    (arguments[0] || 'uuid'),  '_',
                    $.now().toString(16),
                    Math.random().toString(16).slice(2)
                ].join('');
        }
    });

/* ---------- 对象工具方法  v0.8 ---------- */

    $.extend({
        likeArray:    function (iObject) {
            if ((! iObject)  ||  (typeof iObject != 'object'))
                return false;

            iObject = (typeof iObject.valueOf == 'function')  ?
                iObject.valueOf() : iObject;

            return Boolean(
                iObject  &&
                (typeof iObject.length == 'number')  &&
                (typeof iObject != 'string')
            );
        },
        isEqual:      function (iLeft, iRight) {
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
        },
        makeSet:      function () {
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
        },
        trace:            function (iObject, iName, iCount, iCallback) {
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
        },
        intersect:        function () {
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
        }
    });

    var Type_Info = {
            Data:    $.makeSet('String', 'Number', 'Boolean'),
            BOM:     $.makeSet('Window', 'DOMWindow', 'global'),
            DOM:     {
                root:    $.makeSet('Document', 'Window')
            }
        };

    function _Type_(iVar) {
        var iType = typeof iVar;

        try {
            iType = (iType == 'object') ? (
                (iVar && iVar.constructor.name) ||
                Object.prototype.toString.call(iVar).match(/\[object\s+([^\]]+)\]/i)[1]
            ) : (
                iType[0].toUpperCase() + iType.slice(1)
            );
        } catch (iError) {
            return 'Window';
        }

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

        if (iVar.location && (
            iVar.location  ===  (iVar.defaultView || { }).location
        ))
            return 'Document';

        if (
            iType.match(/HTML\w+?Element$/) ||
            (typeof iVar.tagName == 'string')
        )
            return 'HTMLElement';

        if ( $.likeArray(iVar) ) {
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
    }

    $.isData = function (iValue) {
        return  Boolean(iValue)  ||  (_Type_(iValue) in Type_Info.Data);
    };

/* ---------- 字符串扩展（借鉴 PHP） v0.2 ---------- */

    $.extend({
        split:         function (iString, iSplit, iLimit, iJoin) {
            iString = iString.split(iSplit);
            if (iLimit) {
                iString[iLimit - 1] = iString.slice(iLimit - 1).join(
                    (typeof iJoin == 'string') ? iJoin : iSplit
                );
                iString.length = iLimit;
            }
            return iString;
        },
        byteLength:    function () {
            return  arguments[0].replace(
                /[^\u0033-\u007e\uff61-\uffef]/g,  'xx'
            ).length;
        }
    });

/* ---------- URL 处理扩展  v0.3 ---------- */

    $.extend($, {
        paramJSON:    function (Args_Str) {
            Args_Str = (
                Args_Str  ?  $.split(Args_Str, '?', 2)[1]  :  BOM.location.search
            ).match(/[^\?&\s]+/g);

            if (! Args_Str)  return { };

            var _Args_ = { };

            for (var i = 0, iValue;  i < Args_Str.length;  i++) {
                Args_Str[i] = $.split(Args_Str[i], '=', 2);

                iValue = BOM.decodeURIComponent( Args_Str[i][1] );
                try {
                    iValue = $.parseJSON(iValue);
                } catch (iError) { }

                _Args_[ Args_Str[i][0] ] = iValue;
            }

            return _Args_;
        },
        paramSign:        function (iData) {
            iData = (typeof iData == 'string')  ?  $.paramJSON(iData)  :  iData;

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
        }
    });

/* ---------- jQuery 选择符合法性判断  v0.2 ---------- */

    $.isSelector = function () {
        try {
            DOM.querySelector(arguments[0])
        } catch (iError) {
            return false;
        }
        return true;
    };

/* ---------- jQuery 元素成员更新  v0.1 ---------- */

    $.fn.refresh = function () {
        if (! this.selector)  return this;

        var $_New = $(this.selector, this.context);

        if (this.prevObject instanceof $)
            $_New = this.prevObject.pushStack($_New);

        return $_New;
    };

/* ---------- 页面滚动相关操作  v0.2 ---------- */

    var Array_Reverse = Array.prototype.reverse;

    $.fn.extend({
        scrollParents:    function () {
            return  Array_Reverse.call(this.pushStack(
                $.map(this.parents(),  function () {
                    var $_This = $(arguments[0]);

                    if (
                        ($_This.height() < $_This[0].scrollHeight)  ||
                        ($_This.width() < $_This[0].scrollWidth)
                    )
                        return $_This[0];
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

/* ---------- jQuery 元素 z-index 独立方法  v0.2 ---------- */

    function Get_zIndex() {
        var $_This = $(this);

        var _zIndex_ = $_This.css('z-index');
        if (_zIndex_ != 'auto')  return parseInt(_zIndex_);

        var $_Parents = $_This.parents();
        _zIndex_ = 0;

        $_Parents.each(function () {
            var _Index_ = $(this).css('z-index');

            _zIndex_ = _zIndex_ + (
                (_Index_ == 'auto')  ?  1  :  parseInt(_Index_)
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


/* ---------- CSS 规则操作  v0.8 ---------- */

    var IE_CSS_Filter = ($.browser.msie < 9);
    var Code_Indent = (IE_CSS_Filter  ?  ' '.repeat(4)  :  '');

    function toHexInt(iDec, iLength) {
        var iHex = parseInt( Number(iDec).toFixed(0) ).toString(16);

        if (iLength && (iLength > iHex.length))
            iHex = '0'.repeat(iLength - iHex.length) + iHex;

        return iHex;
    }

    function RGB_Hex(iRed, iGreen, iBlue) {
        var iArgs = $.extend([ ], arguments);

        if ((iArgs.length == 1) && (typeof iArgs[0] == 'string'))
            iArgs = iArgs[0].replace(/rgb\(([^\)]+)\)/i, '$1').replace(/,\s*/g, ',').split(',');

        for (var i = 0; i < 3; i++)
            iArgs[i] = toHexInt(iArgs[i], 2);
        return iArgs.join('');
    }

    var PX_Needed = $.makeSet(
            'width',  'min-width',  'max-width',
            'height', 'min-height', 'max-height',
            'margin', 'padding',
            'top',    'left',
            'border-radius'
        );

    function Set_Style(iElement, iName, iValue) {
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

        if ((! isNaN( Number(iValue) ))  &&  PX_Needed[iName])
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
                ($.browser.msie != 9) ? iValue : iValue.toString(),
                'important'
            );
        else  return [
                iString ? (iString + ";\n") : ''
            ].concat([
                iName,  ':',  Code_Indent,  iValue
            ]).join('');
    }

    function CSS_Rule2Text(iRule) {
        var Rule_Text = [''],  Rule_Block,  _Rule_Block_;

        $.each(iRule,  function (iSelector) {
            Rule_Block = iSelector + ' {';
            _Rule_Block_ = [ ];

            for (var iAttribute in this)
                _Rule_Block_.push(
                    Set_Style(null, iAttribute, this[iAttribute])
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

        return  $('<style />', {
            type:       'text/css',
            'class':    'iQuery_CSS-Rule',
            text:       (! iMedia) ? CSS_Text : [
                '@media ' + iMedia + ' {',
                CSS_Text.replace(/\n/m, "\n    "),
                '}'
            ].join("\n")
        }).appendTo(DOM.head)[0].sheet;
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
            var _Rule_ = { };

            this.id = this.id || $.uuid();

            for (var iSelector in iRule)
                _Rule_['#' + this.id + iSelector] = iRule[iSelector];

            var iSheet = $.cssRule(_Rule_);

            if (typeof iCallback == 'function')  iCallback.call(this, iSheet);
        });
    };

/* ---------- DOM 选中内容读写  v0.2 ---------- */

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

/* ---------- DOM UI 数据归并  v0.1 ---------- */

    var iOperator = {
            '+':    function () {
                return  arguments[0] + arguments[1];
            },
            '-':    function () {
                return  arguments[0] - arguments[1];
            }
        };

    $.fn.reduce = function (iMethod, iKey, iCallback) {
        if (arguments.length < 3) {
            iCallback = iKey;
            iKey = undefined;
        }
        if (typeof iCallback == 'string')  iCallback = iOperator[iCallback];

        return  $.map(this,  function () {
            return  $( arguments[0] )[iMethod](iKey);
        }).reduce(iCallback);
    };

/* ---------- DOM UI 数据读写  v0.4 ---------- */

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
            case 'option':      $_This.text(iValue);    break;
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


/* ---------- HTML DOM 沙盒  v0.2 ---------- */
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
                        $.makeArray($(
                            'head style, head link[rel="stylesheet"]',  _DOM_
                        )),
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


/* ---------- HTTP Method 快捷方法  v0.1 ---------- */
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
            crossDomain:    true,
            xhrFields:      {
                withCredentials:    true
            }
        });
    }

    var HTTP_Method = $.makeSet('PUT', 'DELETE');

    for (var iMethod in HTTP_Method)
        $[ iMethod.toLowerCase() ] = $.proxy(HTTP_Request, BOM, iMethod);


/* ---------- Form 元素 无刷新提交  v0.8 ---------- */

    /* ----- AJAX 底层扩展  v0.2 ----- */

    function onLoad(iProperty, iData) {
        if (iProperty)  $.extend(this, iProperty);

        if (! (this.option.crossDomain || (this.readyState == 4)))
            return;

        var iError = (this.status > 399),  iArgs = [this, this.option];

        $_DOM.trigger('ajaxComplete', iArgs);
        $_DOM.trigger('ajax' + (iError ? 'Error' : 'Success'),  iArgs);

        if (typeof this.onready != 'function')  return;

        this.onready(
            iData || this.responseAny(),  iError ? 'error' : 'success',  this
        );
    }

    var Success_State = {
            readyState:    4,
            status:        200,
            statusText:    'OK'
        },
        $_DOM = $(DOM);

    function XD_Request(iData) {
        var iOption = this.option;

        this.open.call(this, iOption.type, iOption.url, true);

        this[this.option.crossDomain ? 'onload' : 'onreadystatechange'] = $.proxy(
            onLoad,
            this,
            (! (this instanceof BOM.XMLHttpRequest))  &&  Success_State,
            null
        );

        if (iOption.xhrFields)  $.extend(this, iOption.xhrFields);

        if (! iOption.crossDomain)
            iOption.headers = $.extend(iOption.headers || { }, {
                'X-Requested-With':    'XMLHttpRequest',
                Accept:                '*/*'
            });

        for (var iKey in iOption.headers)
            this.setRequestHeader(iKey, iOption.headers[iKey]);

        if ((iData instanceof Array)  ||  $.isPlainObject(iData))
            iData = $.param(iData);

        if ((typeof iData == 'string')  ||  iOption.contentType)
            this.setRequestHeader('Content-Type', (
                iOption.contentType || 'application/x-www-form-urlencoded'
            ));

        this.option.data = iData;

        $_DOM.trigger('ajaxSend',  [this, this.option]);

        this.send(iData);

        return this;
    }

    var XHR_Extension = {
            timeOut:        function (iSecond, iCallback) {
                var iXHR = this;

                $.wait(iSecond, function () {
                    iXHR[
                        (iXHR.$_DOM || iXHR.option.crossDomain)  ?
                            'onload'  :  'onreadystatechange'
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
                                iContent = $.parseXML(_Content_);
                                this.responseType = 'text/xml';
                            } catch (iError) { }
                        }
                        break;
                    }
                    case 'xml':      iContent = this.responseXML;
                }

                return iContent;
            },
            retry:          function () {
                $.wait(arguments[0],  $.proxy(XD_Request, this));
            }
        };

    function X_Domain() {
        var iDomain = $.urlDomain( arguments[0] );

        return  iDomain && (
            iDomain != [
                BOM.location.protocol, '//', DOM.domain, (
                    BOM.location.port  ?  (':' + BOM.location.port)  :  ''
                )
            ].join('')
        );
    }

    function beforeOpen(iMethod, iURL, iData) {
        this.option = {
            type:           iMethod.toUpperCase(),
            url:            iURL,
            crossDomain:    X_Domain(iURL),
            data:           iData
        };
        $_DOM.triggerHandler('ajaxPrefilter', [this]);
    }

    /* ----- DOM HTTP 请求对象  v0.2 ----- */

    BOM.DOMHttpRequest = function () {
        this.status = 0;
        this.readyState = 0;
        this.responseType = 'text/plain';
    };
    BOM.DOMHttpRequest.JSONP = { };

    $.extend(BOM.DOMHttpRequest.prototype, XHR_Extension, {
        open:                function (iMethod, iTarget) {
            //  <script />, JSONP
            if (iMethod.match(/^Get$/i)) {
                beforeOpen.apply(this, arguments);
                this.responseURL = this.option.url;
                return;
            }

            //  <iframe />
            var $_Form = $(iTarget).submit(function () {
                    if ( $(this).data('_AJAX_Submitting_') )  return false;
                }),
                iDHR = this;

            beforeOpen.call(this, iMethod, $_Form[0].action);

            $_Form[0].action = this.responseURL = this.option.url;

            var iTarget = $_Form.attr('target');

            if ((! iTarget)  ||  iTarget.match(/^_(top|parent|self|blank)$/i)) {
                iTarget = $.uuid('iframe');
                $_Form.attr('target', iTarget);
            }

            $('iframe[name="' + iTarget + '"]').sandBox(function () {
                $(this).on('load',  function () {
                    $_Form.data('_AJAX_Submitting_', 0);

                    if (iDHR.readyState)  try {
                        onLoad.call(iDHR, $.extend({
                            responseText:
                                $(this).contents().find('body').text()
                        }, Success_State));
                    } catch (iError) { }
                });
            }).attr('name', iTarget);

            this.$_DOM = $_Form;
        },
        send:                function () {
            $_DOM.trigger('ajaxSend',  [this, this.option]);

            if (this.option.type == 'POST')
                this.$_DOM.submit();    //  <iframe />
            else {
                //  <script />, JSONP
                var iURL = this.responseURL.match(/([^\?=&]+\?|\?)?(\w.+)?/);
                if (! iURL)  throw 'Illegal URL !';

                var _UUID_ = $.uuid(),  iDHR = this;

                BOM.DOMHttpRequest.JSONP[_UUID_] = function () {
                    if (iDHR.readyState)
                        onLoad.call(iDHR, Success_State, arguments[0]);
                    delete this[_UUID_];
                    iDHR.$_DOM.remove();
                };
                this.option.data = arguments[0];
                this.responseURL = iURL[1] + $.param(
                    $.extend({ }, arguments[0], $.paramJSON(
                        '?' + iURL[2].replace(
                            /(\w+)=\?/,  '$1=DOMHttpRequest.JSONP.' + _UUID_
                        )
                    ))
                );
                this.$_DOM = $('<script />',  {src: this.responseURL})
                    .appendTo(DOM.head);
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

    $.fn.ajaxSubmit = function (iCallback) {
        if (! this.length)  return this;

        function AJAX_Submit(iEvent) {
            var $_Form = $(this);

            if ((! this.checkValidity())  ||  $_Form.data('_AJAX_Submitting_'))
                return false;

            $_Form.data('_AJAX_Submitting_', 1);

            if (
                $_Form.find('input[type="file"]').length &&
                ($.browser.msie < 10)
            ) {
                var iDHR = new BOM.DOMHttpRequest();
                iDHR.open('POST', $_Form)
                iDHR.onready = iCallback;
                iDHR.send();
                return;
            }

            var iMethod = ($_Form.attr('method') || 'Get').toUpperCase();

            if ((iMethod in HTTP_Method)  ||  (iMethod == 'GET'))
                $[ iMethod.toLowerCase() ](
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


/* ---------- jQuery 元素集合父元素交集  v0.1 ---------- */

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

    $.fn.sameParents = function () {
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
        return  Array_Reverse.call(this.pushStack(
            arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
        ));
    };

/* ---------- 通用聚焦事件  v0.1 ---------- */

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

/* ---------- 鼠标滚轮事件  v0.1 ---------- */

    if ( $.browser.ff )
        $(DOM).on('DOMMouseScroll',  function (iEvent) {
            $(iEvent.target).trigger({
                type:          'mousewheel',
                wheelDelta:    -iEvent.detail * 40
            });
        });

/* ---------- 单点手势事件  v0.2 ---------- */

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
    var iShortCut = $.makeSet('mousewheel', 'tap', 'press', 'swipe');

    function Event_Method(iName) {
        return  function () {
                if (! arguments[0]) {
                    for (var i = 0;  i < this.length;  i++)
                        $(this[i]).trigger(iName);
                } else
                    this.bind(iName, arguments[0]);

                return this;
            };
    }

    for (var iName in iShortCut)
        $.fn[iName] = Event_Method(iName);

    if ($.browser.mobile)  $.fn.click = $.fn.tap;


/* ---------- 文字输入事件  v0.1 ---------- */

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

/* ---------- 跨页面事件  v0.2 ---------- */

    function CrossPageEvent(iType, iSource) {
        if (typeof iType == 'string') {
            this.type = iType;
            this.target = iSource;
        } else
            $.extend(this, iType);

        if (! (iSource instanceof Element))  return;

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

        if ((iTarget === BOM)  ||  (_Type_(iTarget) != 'Window'))
            return this;

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
            ($.browser.msie < 10) ? BOM.JSON.stringify(iData) : iData,  '*'
        );
    };

})(self,  self.document,  self.jQuery || self.Zepto);



/* ---------- W3C HTML 5  Shim ---------- */
(function ($) {

    /* ----- DOM 选择器匹配  v0.1 ----- */

    var DOM_Proto = Element.prototype;

    DOM_Proto.matches = DOM_Proto.matches || DOM_Proto.webkitMatchesSelector ||
        DOM_Proto.msMatchesSelector || DOM_Proto.mozMatchesSelector ||
        function () {
            if (! this.parentNode)  $('<div />')[0].appendChild(this);

            return  ($.inArray(
                this,  this.parentNode.querySelectorAll( arguments[0] )
            ) > -1);
        };

    /* ----- HTML 5 表单验证  v0.1 ----- */

    if (! (($.browser.msie < 10)  ||  $.browser.ios))
        return;

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

})(self.jQuery || self.Zepto);



(function (BOM, DOM, $) {

    /* ----- HTML 5 元素数据集  v0.1 ----- */

    if (! ($.browser.msie < 11))  return;

    function DOMStringMap(iElement) {
        for (var i = 0, iAttr;  i < iElement.attributes.length;  i++) {
            iAttr = iElement.attributes[i];
            if (iAttr.nodeName.slice(0, 5) == 'data-')
                this[ iAttr.nodeName.slice(5).toCamelCase() ] = iAttr.nodeValue;
        }
    }
    try {
        Element.prototype.dataset;

        Object.defineProperty(Element.prototype, 'dataset', {
            get:    function () {
                return  new DOMStringMap(this);
            },
            set:    function () { }
        });
    } catch (iError) { }

})(self,  self.document,  self.jQuery || self.Zepto);