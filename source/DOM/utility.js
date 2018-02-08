define(['../iQuery', '../CSS/ext/pseudo'],  function ($) {

    function DOM_Size(name) {
        name = {
            scroll:    'scroll' + name,
            inner:     'inner' + name,
            client:    'client' + name,
            css:       name.toLowerCase()
        };

        return  function (value) {

            if (! this[0])  return  arguments.length ? this : 0;

            switch ( $.Type(this[0]) ) {
                case 'Document':
                    return  Math.max(
                        this[0].documentElement[ name.scroll ],
                        this[0].body[ name.scroll ]
                    );
                case 'Window':
                    return  this[0][ name.inner ]  ||  Math.max(
                        this[0].document.documentElement[ name.client ],
                        this[0].document.body[ name.client ]
                    );
            }

            if (! $.isNumeric( value ))
                return  this[0][ name.client ]  +  (
                    (this[0].tagName.toLowerCase === 'table')  ?  4  :  0
                );

            for (var i = 0, $_This, _Size_;  this[i];  i++) {

                $_This = $( this[i] );

                _Size_ = $_This.css(name.css, value).css( name.css );

                if (this[i].tagName.toLowerCase() === 'table')
                    $_This.css(name.css,  _Size_ + 4);
            }

            return this;
        };
    }

    var Scroll_Root = $.makeSet('#document', 'html', 'body');

    function Scroll_DOM() {

        return  (this.nodeName.toLowerCase() in Scroll_Root)  ?
            document.scrollingElement  :  this;
    }

    function DOM_Scroll(name) {
        name = {
            scroll:    'scroll' + name,
            offset:    (name === 'Top')  ?  'pageYOffset'  :  'pageXOffset'
        };

        return  function (pixel) {

            pixel = parseFloat( pixel );

            if (isNaN( pixel )) {

                pixel = Scroll_DOM.call( this[0] )[ name.scroll ];

                return  (pixel != null)  ?  pixel  :  (
                    this[0].documentElement[ name.scroll ]  ||
                    this[0].defaultView[ name.offset ]  ||
                    this[0].body[ name.scroll ]
                );
            }

            for (var i = 0;  this[i];  i++)
                if (this[i][ name.scroll ]  !==  undefined)
                    Scroll_DOM.call( this[i] )[ name.scroll ] = pixel;
                else
                    this[i].documentElement[ name.scroll ] =
                        this[i].defaultView[ name.offset ] =
                        this[i].body[ name.scroll ] = pixel;

            return this;
        };
    }

    $.fn.extend({
        slice:             function () {
            return  this.pushStack( [ ].slice.apply(this, arguments) );
        },
        eq:                function (index) {
            return  this.pushStack(
                [ ].slice.call(this,  index,  (index + 1) || undefined)
            );
        },
        detach:            function () {

            return  this.each(function () {  this.remove();  });
        },
        remove:            function () {

            return  this.detach().removeData();
        },
        empty:             function () {

            return  this.contents().remove() && this;
        },
        text:              function (text) {

            var setter = arguments.length,  result = [ ];

            if ( setter )  this.empty();

            for (var i = 0, j = 0;  this[i];  i++)
                if ( setter )
                    this[i].textContent = text;
                else
                    result[j++] = this[i].textContent;

            return  setter ? this : result.join('');
        },
        html:              function (HTML) {

            if (! arguments.length)  return this[0].innerHTML;

            this.empty();

            for (var i = 0;  this[i];  i++)  this[i].innerHTML = HTML;

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
        offset:            function (coordinate) {

            if ($.isPlainObject( coordinate ))
                return  this.css( $.extend({position: 'fixed'},  coordinate) );

            var _DOM_ = (this[0] || { }).ownerDocument;

            var _Body_ = _DOM_  &&  $('body', _DOM_)[0];

            if (!  (_DOM_  &&  _Body_  &&  $.contains(_Body_, this[0])))
                return  {left: 0,  top: 0};

            var $_DOM_ = $(_DOM_),  BCR = this[0].getBoundingClientRect();

            return {
                left:    parseFloat(
                    ($_DOM_.scrollLeft() + BCR.left).toFixed(4)
                ),
                top:     parseFloat(
                    ($_DOM_.scrollTop() + BCR.top).toFixed(4)
                )
            };
        },
        val:               function (value) {
            if ( arguments.length ) {

                if (value instanceof Array)
                    this.filter('select[multiple]').each(function () {

                        for (var i = 0;  this.options[i];  i++)
                            if ($.inArray(this.options[i].value, value))
                                this.options[i].selected = true;
                    });
                else if (value != null)
                    this.not('input[type="file"]').prop('value', value);

                return this;

            } else if ( this[0] ) {

                if (this[0].tagName.toLowerCase() != 'select')
                    return this[0].value;

                value = $.map(this[0].selectedOptions,  function () {

                    return arguments[0].value;
                });

                return  (value.length < 2)  ?  value[0]  :  value;
            }
        },
        serializeArray:    function () {

            var $_Value = this.find('*:field'),  value = [ ];

            for (var i = 0, j = 0;  $_Value[i];  i++)
                if (
                    (! $_Value[i].type.match(/radio|checkbox/i))  ||
                    $_Value[i].checked
                )
                    value[j++] = $( $_Value[i] ).prop(['name', 'value']);

            return value;
        },
        serialize:         function () {
            return  $.param( this.serializeArray() );
        }
    });
});
