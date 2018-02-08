define(['../iQuery', './ext/base'],  function ($) {

    $.fn.extend({
        appendTo:        function () {

            return  this.insertTo(arguments[0], Infinity);
        },
        prependTo:       function () {

            return  this.insertTo( arguments[0] );
        },
        insertBefore:    function ($_Target) {

            var $_This = this;

            return  this.pushStack($( $_Target ).map(function () {

                return  $_This.insertTo(this.parentNode,  $( this ).index());
            }));
        },
        insertAfter:     function ($_Target) {

            var $_This = this;

            return  this.pushStack($( $_Target ).map(function () {

                return  $_This.insertTo(this.parentNode,  $( this ).index() + 1);
            }));
        },
        replaceWith:     function ($_New) {

            $_New = $( $_New );

            return  this.each(function (index) {

                this.replaceWith.apply(this,  index  ?  $_New.clone()  :  $_New);
            });
        }
    });

    $.each(
        {
            appendTo:        'append',
            prependTo:       'prepend',
            insertBefore:    'before',
            insertAfter:     'after',
            replaceWith:     'replaceAll'
        },
        function (method) {

            $.fn[ this ] = function () {

                $( arguments[0] )[ method ]( this );

                return this;
            };
        }
    );

    $.globalEval = function () {

        $('<script />').prop('text', arguments[0]).appendTo('head');
    };

});
