define(['extension/iPseudo'],  function ($) {

    var BOM = self,  DOM = self.document;

    var Array_Reverse = Array.prototype.reverse;

    function DOM_Size(iName) {
        iName = {
            scroll:    'scroll' + iName,
            inner:     'inner' + iName,
            client:    'client' + iName,
            css:       iName.toLowerCase()
        };

        return  function () {
            if (! this[0])  return  arguments.length ? this : 0;

            switch ( $.Type(this[0]) ) {
                case 'Document':
                    return  Math.max(
                        this[0].documentElement[iName.scroll],
                        this[0].body[iName.scroll]
                    );
                case 'Window':
                    return  this[0][iName.inner] || Math.max(
                        this[0].document.documentElement[iName.client],
                        this[0].document.body[iName.client]
                    );
            }
            var iValue = parseFloat(arguments[0]),
                iFix = this.is('table') ? 4 : 0;

            if (isNaN( iValue ))  return  this[0][iName.client] + iFix;

            for (var i = 0;  i < this.length;  i++)
                this[i].style[iName.css] = iValue - iFix;
            return this;
        };
    }

    function Scroll_DOM() {
        return (
            ($.browser.webkit || (
                (this.tagName || '').toLowerCase()  !=  'body'
            )) ?
            this : this.ownerDocument.documentElement
        );
    }

    function DOM_Scroll(iName) {
        iName = {
            scroll:    'scroll' + iName,
            offset:    (iName == 'Top') ? 'pageYOffset' : 'pageXOffset'
        };

        return  function (iPX) {
            iPX = parseInt(iPX);

            if ( isNaN(iPX) ) {
                iPX = Scroll_DOM.call(this[0])[iName.scroll];

                return  (iPX !== undefined) ? iPX : (
                    this[0].documentElement[iName.scroll] ||
                    this[0].defaultView[iName.offset] ||
                    this[0].body[iName.scroll]
                );
            }
            for (var i = 0;  i < this.length;  i++) {
                if (this[i][iName.scroll] !== undefined) {
                    Scroll_DOM.call(this[i])[iName.scroll] = iPX;
                    continue;
                }
                this[i].documentElement[iName.scroll] =
                    this[i].defaultView[iName.offset] =
                    this[i].body[iName.scroll] = iPX;
            }
        };
    }

    function DOM_Map() {

        var iArgs = $.makeArray( arguments );

        var CoreBack = (typeof iArgs.slice(-1)[0] == 'function')  &&  iArgs.pop();

        var _Not_ = iArgs.shift(),  _Reverse_ = iArgs[0];

        return  function ($_Filter) {
            var $_Result = this;

            if (CoreBack)  $_Result = $.map($_Result, CoreBack);

            if ($.isNumeric( $_Filter ))
                $_Result = $.map($_Result,  function (iDOM) {

                    return  (iDOM.nodeType == $_Filter)  ?  iDOM  :  null;
                });
            else if ($_Filter)
                $_Result = $.map($_Result,  function (iDOM) {

                    var _Is_ = $( iDOM ).is( $_Filter );

                    return  (_Not_  ?  (! _Is_)  :  _Is_)  ?  iDOM  :  null;
                });

            $_Result = this.pushStack( $_Result );

            return  _Reverse_  ?  Array_Reverse.call( $_Result )  :  $_Result;
        };
    }

    $.fn.extend({
        add:                function () {
            return this.pushStack(
                $.merge(this,  $.apply(BOM, arguments))
            );
        },
        slice:              function () {
            return  this.pushStack( [ ].slice.apply(this, arguments) );
        },
        eq:                 function (Index) {
            return  this.pushStack(
                [ ].slice.call(this,  Index,  (Index + 1) || undefined)
            );
        },
        each:               function () {
            return  $.each(this, arguments[0]);
        },
        is:                 function ($_Match) {
            var iPath = (typeof $_Match == 'string'),
                iMatch = (typeof Element.prototype.matches == 'function');

            for (var i = 0;  i < this.length;  i++) {
                if (this[i] === $_Match)  return true;

                if (iPath && iMatch)  try {
                    if (this[i].matches( $_Match ))  return true;
                } catch (iError) { }

                if (! this[i].parentNode)  $('<div />')[0].appendChild( this[i] );

                if (-1  <  $.inArray(this[i], (
                    iPath  ?  $($_Match, this[i].parentNode)  :  $($_Match)
                )))
                    return true;
            }

            return false;
        },
        filter:             DOM_Map(),
        not:                DOM_Map(true),
        removeAttr:         function (iAttr) {
            iAttr = iAttr.trim().split(/\s+/);

            for (var i = 0;  i < iAttr.length;  i++)
                this.attr(iAttr[i], null);

            return this;
        },
        addBack:            function () {
            return  this.pushStack( $.merge(this, this.prevObject) );
        },
        parent:             DOM_Map(function () {
            return arguments[0].parentElement;
        }),
        parents:            DOM_Map('',  true,  function () {
            return  $.trace(arguments[0], 'parentElement').slice(0, -1);
        }),
        parentsUntil:       function () {
            return  Array_Reverse.call(
                this.parents().not( $(arguments[0]).parents().addBack() )
            );
        },
        children:           DOM_Map(function () {
            return  $.makeArray( arguments[0].children );
        }),
        contents:           DOM_Map(function (iDOM) {
            return (iDOM.tagName != 'IFRAME')  ?
                $.makeArray( iDOM.childNodes )  :  iDOM.contentWindow.document;
        }),
        nextAll:            DOM_Map(function () {
            return  $.trace(arguments[0], 'nextElementSibling');
        }),
        prevAll:            DOM_Map('',  true,  function () {
            return  $.trace(arguments[0], 'previousElementSibling');
        }),
        siblings:           function () {
            var $_Result = this.prevAll().add( this.nextAll() );

            return this.pushStack(
                arguments[0]  ?  $_Result.filter(arguments[0])  :  $_Result
            );
        },
        find:               function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $.merge($_Result,  $(arguments[0], this[i]));

            return  this.pushStack($_Result);
        },
        has:                function ($_Filter) {
            if (typeof $_Filter != 'string') {
                var _UUID_ = $.uuid('Has');
                $($_Filter).addClass(_UUID_);
                $_Filter = '.' + _UUID_;
            }

            return  this.pushStack($.map(this,  function () {
                if ( $($_Filter, arguments[0]).removeClass(_UUID_).length )
                    return arguments[0];
            }));
        },
        detach:             function () {
            for (var i = 0;  i < this.length;  i++)
                if (this[i].parentNode)
                    this[i].parentNode.removeChild(this[i]);

            return this;
        },
        remove:             function () {
            return this.detach();
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

            for (var i = 0, j = 0;  i < this.length;  i++)
                if (iGetter)
                    iResult[j++] = this[i].textContent;
                else
                    this[i].textContent = iText;

            return  iResult.length ? iResult.join('') : this;
        },
        html:               function (iHTML) {
            if (! $.isData(iHTML))
                return this[0].innerHTML;

            this.empty();

            for (var i = 0;  i < this.length;  i++)
                this[i].innerHTML = iHTML;

            return  this;
        },
        width:              DOM_Size('Width'),
        height:             DOM_Size('Height'),
        scrollTop:          DOM_Scroll('Top'),
        scrollLeft:         DOM_Scroll('Left'),
        position:           function () {
            return  {
                left:    this[0].offsetLeft,
                top:     this[0].offsetTop
            };
        },
        offset:             function (iCoordinate) {
            if ( $.isPlainObject(iCoordinate) )
                return this.css($.extend({
                    position:    'fixed'
                }, iCoordinate));

            var _DOM_ = (this[0] || { }).ownerDocument;
            var _Body_ = _DOM_  &&  $('body', _DOM_)[0];

            if (!  (_DOM_  &&  _Body_  &&  $.contains(_Body_, this[0])))
                return  {left: 0,  top: 0};

            var $_DOM_ = $(_DOM_),  iBCR = this[0].getBoundingClientRect();

            return {
                left:    parseFloat(
                    ($_DOM_.scrollLeft() + iBCR.left).toFixed(4)
                ),
                top:     parseFloat(
                    ($_DOM_.scrollTop() + iBCR.top).toFixed(4)
                )
            };
        },
        addClass:           function (new_Class) {
            if (typeof new_Class != 'string')  return this;

            new_Class = new_Class.trim().split(/\s+/);

            return  this.attr('class',  function (_Index_, old_Class) {
                old_Class = (old_Class || '').trim().split(/\s+/);

                for (var i = 0, j = old_Class.length;  i < new_Class.length;  i++)
                    if ($.inArray(new_Class[i], old_Class) == -1)
                        old_Class[j++] = new_Class[i];

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

                for (var i = 0, j = 0;  i < old_Class.length;  i++)
                    if ($.inArray(old_Class[i], iClass) == -1)
                        new_Class[j++] = old_Class[i];

                return  new_Class.join(' ');
            });
        },
        hasClass:           function (iName) {
            return  (!!  $.map(this,  function () {
                return arguments[0].classList.contains(iName);
            })[0]);
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

            for (var i = 0, j = 0;  i < $_Value.length;  i++)
                if (
                    (! $_Value[i].type.match(/radio|checkbox/i))  ||
                    $_Value[i].checked
                )
                    iValue[j++] = $($_Value[i]).prop(['name', 'value']);

            return iValue;
        },
        serialize:          function () {
            return  $.param( this.serializeArray() );
        }
    });

});