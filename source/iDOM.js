define(['iTraversing'],  function ($) {

    function DOM_Size(iName) {
        iName = {
            scroll:    'scroll' + iName,
            inner:     'inner' + iName,
            client:    'client' + iName,
            css:       iName.toLowerCase()
        };

        return  function (iValue) {
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

            if (! $.isNumeric(iValue))
                return  this[0][iName.client] + (
                    (this[0].tagName == 'TABLE')  ?  4  :  0
                );

            for (var i = 0, $_This, _Size_;  this[i];  i++) {
                $_This = $( this[i] );

                _Size_ = $_This.css(iName.css, iValue).css(iName.css);

                if (this[i].tagName == 'TABLE')
                    $_This.css(iName.css,  _Size_ + 4);
            }

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

    $.fn.extend({
        slice:             function () {
            return  this.pushStack( [ ].slice.apply(this, arguments) );
        },
        eq:                function (Index) {
            return  this.pushStack(
                [ ].slice.call(this,  Index,  (Index + 1) || undefined)
            );
        },
        each:              function () {
            return  $.each(this, arguments[0]);
        },
        removeAttr:        function (iAttr) {
            iAttr = iAttr.trim().split(/\s+/);

            for (var i = 0;  i < iAttr.length;  i++)
                this.attr(iAttr[i], null);

            return this;
        },
        detach:            function () {
            for (var i = 0;  i < this.length;  i++)
                if (this[i].parentNode)
                    this[i].parentNode.removeChild(this[i]);

            return this;
        },
        remove:            function () {
            return  this.detach().data('', null);
        },
        empty:             function () {
            this.children().remove();

            for (var i = 0, iChild;  i < this.length;  i++) {
                iChild = this[i].childNodes;
                for (var j = 0;  j < iChild.length;  j++)
                    this[i].removeChild(iChild[j]);
            }

            return this;
        },
        text:              function (iText) {
            var iGetter = (! $.isData(iText)),  iResult = [ ];

            if (! iGetter)  this.empty();

            for (var i = 0, j = 0;  i < this.length;  i++)
                if (iGetter)
                    iResult[j++] = this[i].textContent;
                else
                    this[i].textContent = iText;

            return  iResult.length ? iResult.join('') : this;
        },
        html:              function (iHTML) {
            if (! $.isData(iHTML))
                return this[0].innerHTML;

            this.empty();

            for (var i = 0;  i < this.length;  i++)
                this[i].innerHTML = iHTML;

            return  this;
        },
        width:             DOM_Size('Width'),
        height:            DOM_Size('Height'),
        scrollTop:         DOM_Scroll('Top'),
        scrollLeft:        DOM_Scroll('Left'),
        position:          function () {
            return  {
                left:    this[0].offsetLeft,
                top:     this[0].offsetTop
            };
        },
        offset:            function (iCoordinate) {
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
        val:               function () {
            if (! $.isData(arguments[0]))
                return  this[0] && this[0].value;
            else
                return  this.not('input[type="file"]').prop('value', arguments[0]);
        },
        serializeArray:    function () {
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
        serialize:         function () {
            return  $.param( this.serializeArray() );
        }
    });

});