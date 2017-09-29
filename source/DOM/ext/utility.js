define([
    '../../utility/ext/string', '../traversing', '../../polyfill/Promise_A+',
    '../insert'
],  function ($) {

    var iOperator = {
            '+':    function () {
                return  arguments[0] + arguments[1];
            },
            '-':    function () {
                return  arguments[0] - arguments[1];
            }
        };

    function Array_Reverse() {

        return  ($.Type( this )  !=  'iQuery')  ?
            this  :  Array.prototype.reverse.call( this );
    }

    $.fn.extend({
        reduce:           function (iMethod, iKey, iCallback) {

            if (arguments.length < 3)    iCallback = iKey,  iKey = '';

            if (typeof iCallback === 'string')
                iCallback = iOperator[ iCallback ];

            return  $.map(this,  function () {

                return  $.fn[ iMethod ].apply(
                    $( arguments[0] ),  iKey ? [iKey] : []
                );
            }).reduce( iCallback );
        },
        sameParents:      function () {

            if (this.length < 2)  return this.parents();

            var iMin = $.trace(this[0], 'parentNode').slice(0, -1),  iPrev;

            for (var i = 1, iLast;  this[i];  i++) {

                iLast = $.trace(this[i], 'parentNode').slice(0, -1);

                if (iLast.length < iMin.length)    iPrev = iMin,  iMin = iLast;
            }

            iPrev = iPrev || iLast;

            var iDiff = iPrev.length - iMin.length,  $_Result = [ ];

            for (var i = 0;  iMin[i];  i++)
                if (iMin[i]  ===  iPrev[i + iDiff]) {
                    $_Result = iMin.slice(i);
                    break;
                }

            return Array_Reverse.call(this.pushStack(
                arguments[0]  ?  $( $_Result ).filter( arguments[0] )  :  $_Result
            ));
        },
        scrollParents:    function () {

            return Array_Reverse.call(this.pushStack($.merge(
                this.eq(0).parents(':scrollable'),  [ document ]
            )));
        },
        scrollTo:         function () {

            if (! this[0])  return this;

            var $_This = this;

            $( arguments[0] ).each(function () {

                var $_Scroll = $_This.has( this );

                var iCoord = $( this ).offset(),  _Coord_ = $_Scroll.offset();

                if (! $_Scroll.length)  return;

                $_Scroll.animate({
                    scrollTop:     (! _Coord_.top)  ?  iCoord.top  :  (
                        $_Scroll.scrollTop()  +  (iCoord.top - _Coord_.top)
                    ),
                    scrollLeft:    (! _Coord_.left)  ?  iCoord.left  :  (
                        $_Scroll.scrollLeft()  +  (iCoord.left - _Coord_.left)
                    )
                });
            });

            return this;
        },
        mediaReady:       function () {

            var $_Media = this.find('img, audio, video')
                    .addBack('img, audio, video');

            return  new Promise(function (resolve) {

                $.every(0.25,  function () {

                    if (! ($_Media = $_Media.not(':loaded'))[0])
                        return  (!! resolve());
                });
            });
        }
    });

/* ---------- HTML DOM SandBox ---------- */

    $.fn.sandBox = function () {

        var iArgs = $.makeArray( arguments );

        var iCallback = (typeof iArgs.slice(-1)[0] == 'function')  &&  iArgs.pop();

        var iHTML = $.isSelector( iArgs[0] )  ?  ''  :  iArgs.shift();

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

                if ( $.browser.msie )  self.CollectGarbage();

                return false;
            }

            if (! iHTML)  Frame_Ready();

            $.every(0.04, Frame_Ready);

            _DOM_.write(iHTML);    _DOM_.close();

        }).attr(
            'src',  ((! iHTML.match(/<.+?>/)) && iHTML.trim())  ||  'about:blank'
        );

        return  $_iFrame[0].parentElement ? this : $_iFrame.appendTo('body');
    };

});
