define(['jquery'],  function ($) {

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
        inViewport:       function () {
            for (var i = 0, _OS_, $_BOM, BOM_W, BOM_H;  this[i];  i++) {
                _OS_ = $( this[i] ).offset();

                $_BOM = $( this[i].ownerDocument.defaultView );

                BOM_W = $_BOM.width(),  BOM_H = $_BOM.height();

                if (
                    (_OS_.left > BOM_W)  ||
                    ((_OS_.top - $(DOM).scrollTop())  >  BOM_H)
                )
                    return false;
            }

            return true;
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

        return  $_iFrame[0].parentElement ? this : $_iFrame.appendTo(DOM.body);
    };

});