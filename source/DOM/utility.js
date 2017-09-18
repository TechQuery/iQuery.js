define(['../iQuery', '../CSS/ext/pseudo'],  function ($) {

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

    var Scroll_Root = $.makeSet('#document', 'html', 'body');

    function Scroll_DOM() {

        return  (this.nodeName.toLowerCase() in Scroll_Root)  ?
            document.scrollingElement  :  this;
    }

    function DOM_Scroll(iName) {
        iName = {
            scroll:    'scroll' + iName,
            offset:    (iName == 'Top') ? 'pageYOffset' : 'pageXOffset'
        };

        return  function (iPX) {
            iPX = parseFloat(iPX);

            if ( isNaN(iPX) ) {
                iPX = Scroll_DOM.call(this[0])[iName.scroll];

                return  (iPX != null)  ?  iPX  :  (
                    this[0].documentElement[iName.scroll] ||
                    this[0].defaultView[iName.offset] ||
                    this[0].body[iName.scroll]
                );
            }

            for (var i = 0;  this[i];  i++) {
                if (this[i][iName.scroll] !== undefined) {
                    Scroll_DOM.call(this[i])[iName.scroll] = iPX;
                    continue;
                }
                this[i].documentElement[iName.scroll] =
                    this[i].defaultView[iName.offset] =
                    this[i].body[iName.scroll] = iPX;
            }

            return this;
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
        detach:            function () {

            for (var i = 0;  this[i];  i++)
                if ( this[i].parentNode )
                    this[i].parentNode.removeChild( this[i] );

            return this;
        },
        remove:            function () {

            return  this.detach().removeData();
        },
        empty:             function () {

            this.children().remove()

            return  this.each(function () {

                iChild = this.childNodes;

                for (var i = 0;  iChild[i];  i++)
                    this.removeChild( iChild[i] );
            });
        },
        text:              function (iText) {

            var iSetter = arguments.length,  iResult = [ ];

            if ( iSetter )  this.empty();

            for (var i = 0, j = 0;  this[i];  i++)
                if ( iSetter )
                    this[i].textContent = iText;
                else
                    iResult[j++] = this[i].textContent;

            return  iSetter ? this : iResult.join('');
        },
        html:              function (iHTML) {

            if (! arguments.length)  return this[0].innerHTML;

            this.empty();

            for (var i = 0;  this[i];  i++)  this[i].innerHTML = iHTML;

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

            if ($.isPlainObject( iCoordinate ))
                return  this.css( $.extend({position: 'fixed'},  iCoordinate) );

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
        val:               function (iValue) {
            if ( arguments.length ) {

                if (iValue instanceof Array)
                    this.filter('select[multiple]').each(function () {

                        for (var i = 0;  this.options[i];  i++)
                            if ($.inArray(this.options[i].value, iValue))
                                this.options[i].selected = true;
                    });
                else if (iValue != null)
                    this.not('input[type="file"]').prop('value', iValue);

                return this;

            } else if ( this[0] ) {

                if (this[0].tagName.toLowerCase() != 'select')
                    return this[0].value;

                iValue = $.map(this[0].selectedOptions,  function () {

                    return arguments[0].value;
                });

                return  (iValue.length < 2)  ?  iValue[0]  :  iValue;
            }
        },
        serializeArray:    function () {

            var $_Value = this.find('*:field'),  iValue = [ ];

            for (var i = 0, j = 0;  $_Value[i];  i++)
                if (
                    (! $_Value[i].type.match(/radio|checkbox/i))  ||
                    $_Value[i].checked
                )
                    iValue[j++] = $( $_Value[i] ).prop(['name', 'value']);

            return iValue;
        },
        serialize:         function () {
            return  $.param( this.serializeArray() );
        }
    });
});
