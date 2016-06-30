define(['iCore'],  function ($) {

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

    function DOM_Insert(iName) {
        return  function () {
            if (
                this.length &&
                (!  this.before.apply($(this[0][iName]), arguments).length)
            )
                this.append.apply(
                    (iName == 'firstElementChild')  ?  this  :  this.parent(),
                    arguments
                );

            return this;
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
        filter:             function () {
            var $_Result = [ ];

            for (var i = 0, j = 0;  i < this.length;  i++)
                if ($( this[i] ).is( arguments[0] ))
                    $_Result[j++] = this[i];

            return this.pushStack($_Result);
        },
        not:                function () {
            var $_Result = [ ];

            for (var i = 0, j = 0;  i < this.length;  i++)
                if (! $( this[i] ).is( arguments[0] ))
                    $_Result[j++] = this[i];

            return this.pushStack($_Result);
        },
        removeAttr:         function (iAttr) {
            iAttr = iAttr.trim().split(/\s+/);

            for (var i = 0;  i < iAttr.length;  i++)
                this.attr(iAttr[i], null);

            return this;
        },
        addBack:            function () {
            return  this.pushStack( $.merge(this, this.prevObject) );
        },
        parent:             function () {
            var $_Result = [ ];

            for (var i = 0, j = 0;  i < this.length;  i++)
                if ($.inArray(this[i].parentNode, $_Result) == -1)
                    $_Result[j++] = this[i].parentNode;

            return this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            );
        },
        parents:            function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $_Result.concat(
                    $.trace(this[i], 'parentNode').slice(0, -1)
                );

            return  Array_Reverse.call(this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            ));
        },
        parentsUntil:       function () {
            return  Array_Reverse.call(
                this.parents().not( $(arguments[0]).parents().addBack() )
            );
        },
        children:           function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $.merge($_Result, this[i].children);

            return this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            );
        },
        contents:           function () {
            var $_Result = [ ],
                Type_Filter = parseInt(arguments[0]);

            for (var i = 0;  i < this.length;  i++)
                $_Result = $.merge(
                    $_Result,
                    (this[i].tagName.toLowerCase() != 'iframe') ?
                        this[i].childNodes : this[i].contentWindow.document
                );
            if ($.Type(Type_Filter) == 'Number')
                for (var i = 0;  i < $_Result.length;  i++)
                    if ($_Result[i].nodeType != Type_Filter)
                        $_Result[i] = null;

            return this.pushStack($_Result);
        },
        nextAll:            function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $_Result.concat(
                    $.trace(this[i], 'nextElementSibling')
                );

            return this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            );
        },
        prevAll:            function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $_Result.concat(
                    $.trace(this[i], 'previousElementSibling')
                );
            $_Result.reverse();

            return Array_Reverse.call(this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            ));
        },
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
        hasClass:           function () {
            try {
                return this[0].classList.contains(arguments[0]);
            } catch (iError) {
                return false;
            }
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
                    if (_Brother_[i] !== this)
                        _Cache_.appendChild(_Brother_[i]);

                this.parentNode.insertBefore(_Cache_, this);
            });
        },
        prepend:            DOM_Insert('firstElementChild'),
        prependTo:          function () {
            $(arguments[0], arguments[1]).prepend(this);

            return  this;
        },
        after:              DOM_Insert('nextElementSibling'),
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