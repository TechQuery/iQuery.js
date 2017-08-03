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

            $_New = $.buildFragment( $( $_New ) );

            return  this.each(function () {

                if ( this.parentNode )
                    this.parentNode.replaceChild(
                        arguments[0]  ?  $_New.cloneNode( true )  :  $_New,
                        this
                    );
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