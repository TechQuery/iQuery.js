define(['../iCore', './ext/base'],  function ($) {

    $.fn.extend({
        appendTo:        function () {

            return  this.insertTo(arguments[0], Infinity);
        },
        prependTo:       function () {

            return  this.insertTo( arguments[0] );
        },
        insertBefore:    function ($_Target) {

            var $_This = this;

            return  this.pushStack($.map($( $_Target ),  function (iDOM) {

                return  $_This.insertTo(iDOM.parentNode,  $( iDOM ).index());
            }));
        },
        insertAfter:     function ($_Target) {

            var $_This = this;

            return  this.pushStack($.map($( $_Target ),  function (iDOM) {

                return  $_This.insertTo(iDOM.parentNode,  $( iDOM ).index() + 1);
            }));
        }
    });

    $.each(
        {
            appendTo:        'append',
            prependTo:       'prepend',
            insertBefore:    'before',
            insertAfter:     'after'
        },
        function (iMethod) {

            $.fn[ arguments[1] ] = function () {

                $( arguments[0] )[ iMethod ]( this );

                return this;
            };
        }
    );

    $.globalEval = function () {

        $('<script />').prop('text', arguments[0]).appendTo('head');
    };

});