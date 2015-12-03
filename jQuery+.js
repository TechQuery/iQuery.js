//
//              >>>  jQuery+  <<<
//
//
//    [Version]     v5.1  (2015-12-3)
//
//    [Based on]    jQuery  v1.9+
//
//
//        (C)2014-2015  shiy2008@gmail.com
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

/* ---------- 类型判断+  v0.3 ---------- */

    function _inKey_() {
        var iObject = { };

        for (var i = 0;  i < arguments.length;  i++)
            iObject[arguments[i]] = true;

        return iObject;
    }

    var Type_Info = {
            Data:    _inKey_('String', 'Number', 'Boolean', 'Null'),
            BOM:     _inKey_('Window', 'DOMWindow', 'global'),
            DOM:     {
                root:    _inKey_('Document', 'Window')
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
    }

    $.isData = function () {
        return  (_Type_(arguments[0]) in Type_Info.Data);
    };

/* ---------- 对象值相等  v0.1 ---------- */

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

/* ---------- 字符串切割扩展（类 PHP） v0.1 ---------- */

    $.split = function (iString, iSplit, iLimit, iJoin) {
        iString = iString.split(iSplit);
        if (iLimit) {
            iString[iLimit - 1] = iString.slice(iLimit - 1).join(
                (typeof iJoin == 'string') ? iJoin : iSplit
            );
            iString.length = iLimit;
        }
        return iString;
    };

/* ---------- URL 处理扩展  v0.2 ---------- */

    $.extend($, {
        paramJSON:    function (Args_Str) {
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
                    iValue = BOM.JSON.parseAll(iValue);
                } catch (iError) { }

                _Args_[ Args_Str[i][0] ] = iValue;
            }

            return  Args_Str.length ? _Args_ : { };
        },
        fileName:     function () {
            return  (arguments[0] || BOM.location.pathname)
                    .split('?')[0].split('/').slice(-1)[0];
        },
        filePath:         function () {
            return  $.split(arguments[0] || BOM.location.href,  '?',  2)[0]
                    .split('/').slice(0, -1).join('/');
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


/* ---------- CSS 规则操作  v0.7 ---------- */

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

    var PX_Needed = _inKey_(
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
            'class':    'jQuery_CSS-Rule',
            text:       (! iMedia) ? CSS_Text : [
                '@media ' + iMedia + ' {',
                CSS_Text.replace(/\n/m, "\n    "),
                '}'
            ].join("\n")
        }).appendTo(DOM.head)[0].sheet;
    };

    $.fn.cssRule = function (iRule, iCallback) {
        return  this.each(function () {
                var $_This = $(this);
                var _UUID_ = $_This.data('css') || $.uuid();

                $(this).attr('data-css', _UUID_);
                for (var iSelector in iRule) {
                    iRule['*[data-css="' + _UUID_ + '"]' + iSelector] = iRule[iSelector];
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


/* ---------- DOM UI 数据读写  v0.4 ---------- */

    var RE_URL = /^(\w+:)?\/\/[\u0033-\u007e\uff61-\uffef]+$/;

    function Value_Operator(iValue, iResource) {
        var $_This = $(this),
            End_Element = (! this.children.length);

        var _Set_ = iValue || $.isData(iValue),
            iURL = (typeof iValue == 'string')  &&  iValue.trim().match(RE_URL);

        switch ( this.tagName.toLowerCase() ) {
            case 'a':        {
                if (_Set_) {
                    if (iURL)
                        $_This.attr('href', iURL[0]);
                    if (End_Element)
                        $_This.text(iValue);
                    return;
                }
                return  $_This.attr('href')  ||  (End_Element && $_This.text());
            }
            case 'img':      {
                iResource.count++ ;
                console.log(this);

                return  $_This.one('load',  function () {
                    $(this).trigger('ready');
                }).addClass('jQuery_Loading').attr('src', iValue);
            }
            case 'textarea':    ;
            case 'select':      ;
            case 'input':       {
                if ((this.type || '').match(/radio|checkbox/i)  &&  (this.value == iValue))
                    this.checked = true;
                return $_This.val(iValue);
            }
            default:         {
                if (_Set_) {
                    if ((! End_Element)  &&  iURL)
                        $_This.css('background-image',  'url("' + iValue + '")');
                    else
                        $_This.html(iValue);
                    return;
                }
                iURL = $_This.css('background-image').match(/^url\(('|")?([^'"]+)('|")?\)/);
                return  (End_Element && $_This.text())  ||  (iURL && iURL[2]);
            }
        }
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


/* ---------- HTTP Method 快捷方法  v0.1 ---------- */
    function iHTTP(iMethod, iURL, iData, iCallback) {
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

    $['delete'] = function () {
        var iArgs = $.makeArray(arguments);
        iArgs.unshift('DELETE');

        return  iHTTP.apply(BOM, iArgs);
    };

    $.put = function () {
        var iArgs = $.makeArray(arguments);
        iArgs.unshift('PUT');

        return  iHTTP.apply(BOM, iArgs);
    };

/* ---------- Form 元素 无刷新提交  v0.5 ---------- */

    /* ----- DOM HTTP 请求对象  v0.2 ----- */
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
            retry:          function (Wait_Seconds) {
                var iXHR = new this.constructor,
                    iData = this.requestData;
                iXHR.onready = this.onready;
                iXHR.open.apply(iXHR, this.requestArgs);

                $.wait(Wait_Seconds, function () {
                    iXHR.withCredentials = true;

                    if (typeof iData == 'string')
                        iXHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    if (! iXHR.crossDomain) {
                        iXHR.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                        iXHR.setRequestHeader('Accept', '*/*');
                    }
                    iXHR.send(iData);
                });
            }
        };

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
                iTarget = $.uuid('iframe');
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

                var _UUID_ = $.uuid(),  iDHR = this;

                BOM.DOMHttpRequest.JSONP[_UUID_] = function () {
                    if (iDHR.readyState) {
                        iDHR.status = 200;
                        iDHR.readyState = 4;
                        iDHR.onready.apply(iDHR, arguments);
                    }
                    delete this[_UUID_];
                    iDHR.$_DOM.remove();
                };
                this.requestData = arguments[0];
                this.responseURL = iURL[1] + $.param(
                    $.extend({ }, arguments[0], $.paramJSON(
                        iURL[2].replace(/(\w+)=\?/,  '$1=DOMHttpRequest.JSONP.' + _UUID_)
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

            var iData = { };
            if (! $_Form.find('input[type="file"]').length) {
                var _Data_ = $_Form.serializeArray();
                for (var i = 0;  i < _Data_.length;  i++)
                    iData[_Data_[i].name] = _Data_[i].value;
            } else {
                if (! ($.browser.msie < 10))
                    iData = new FormData($_Form[0]);
                else {
                    var iDHR = new BOM.DOMHttpRequest();
                    iDHR.open('POST', $_Form)
                    iDHR.onready = iCallback;
                    iDHR.send();
                    return;
                }
            }
            var iMethod = ($_Form.attr('method') || 'Get').toLowerCase();

            if ( this.checkValidity() )  switch (iMethod) {
                case 'get':       ;
                case 'delete':
                    $[iMethod](this.action + $.param($_Form.serializeArray()),  AJAX_Ready);    break;
                case 'post':      ;
                case 'put':
                    $[iMethod](this.action, this, AJAX_Ready);
            } else
                $_Button.prop('disabled', false);
        });
        $_Button.prop('disabled', false);

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

        var iMin = Object_Seek.call(this[0], 'parentNode'),  iPrev;

        for (var i = 1, iLast;  i < this.length;  i++) {
            iLast = Object_Seek.call(this[i], 'parentNode');
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
        return this.pushStack(
            arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
        );
    };

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
                iTime = iEvent.timeStamp - Touch_Data.time;

            if (Math.max(Math.abs(swipeLeft), Math.abs(swipeTop)) > 20)
                $(iEvent.target).trigger('swipe',  [swipeLeft, swipeTop]);
            else
                $(iEvent.target).trigger((iTime > 300) ? 'press' : 'tap');
        }
    );

    var iShortCut = _inKey_('tap', 'press', 'swipe');

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


/* ---------- 跨页面事件  v0.2 ---------- */

    function CrossPageEvent(iType, iSource) {
        if (typeof iType == 'string') {
            this.type = iType;
            this.target = iSource;
        } else
            $.extend(this, iType);

        if (iSource)  $.extend(this, iSource.dataset);
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

        $_BOM.on('message',  function (iEvent) {
            iEvent = iEvent.originalEvent || iEvent;

            var iReturn = new CrossPageEvent(iEvent.data);

            if (
                (iEvent.source === iTarget)  &&
                (iReturn.type == iType)  &&
                $.isEqual(iReturn, _Event_)
            ) {
                iCallback.call($_Source ? $_Source[0] : this,  iReturn);
                $_BOM.off('message', arguments.callee);
            }
        });

        iTarget.postMessage(
            $.extend({data: iData},  _Event_.valueOf()),  '*'
        );
    };

})(self,  self.document,  self.jQuery || self.Zepto);



/* ---------- W3C HTML 5  Shim ---------- */
(function ($) {

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

    /* ----- HTML 5 元素数据集  v0.1 ----- */

    if ($.browser.modern)  return;

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

})(self.jQuery || self.Zepto);