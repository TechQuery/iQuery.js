define([
    '../../iQuery', '../../utility/ext/string', '../traversing',
    '../../polyfill/ES/Promise_A+', '../insert'
],  function ($) {

    var operator = {
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
        reduce:           function (method, key, callback) {

            if (arguments.length < 3)  callback = key, key = '';

            if (typeof callback === 'string')
                callback = operator[ callback ];

            return  $.map(this,  function () {

                return  $.fn[ method ].apply(
                    $( arguments[0] ),  key ? [key] : []
                );
            }).reduce( callback );
        },
        sameParents:      function (filter) {

            if (this.length < 2)  return this.parents();

            var min = $.trace(this[0], 'parentNode').slice(0, -1),  previous;

            for (var i = 1, last;  this[i];  i++) {

                last = $.trace(this[i], 'parentNode').slice(0, -1);

                if (last.length < min.length)    previous = min,  min = last;
            }

            previous = previous || last;

            var diff = previous.length - min.length,  $_Result = [ ];

            for (var i = 0;  min[i];  i++)
                if (min[i]  ===  previous[i + diff]) {

                    $_Result = min.slice(i);    break;
                }

            return Array_Reverse.call(this.pushStack(
                filter  ?  $( $_Result ).filter( filter )  :  $_Result
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

                var coord = $( this ).offset(),  _Coord_ = $_Scroll.offset();

                if (! $_Scroll.length)  return;

                $_Scroll.animate({
                    scrollTop:     (! _Coord_.top)  ?  coord.top  :  (
                        $_Scroll.scrollTop()  +  (coord.top - _Coord_.top)
                    ),
                    scrollLeft:    (! _Coord_.left)  ?  coord.left  :  (
                        $_Scroll.scrollLeft()  +  (coord.left - _Coord_.left)
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
});
