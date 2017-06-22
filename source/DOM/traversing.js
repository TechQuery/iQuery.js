define(['../iQuery', '../CSS/class'],  function ($) {

    var Array_Reverse = Array.prototype.reverse;

    function DOM_Map() {

        var iArgs = $.makeArray( arguments );

        var CoreBack = (typeof iArgs.slice(-1)[0] == 'function')  &&  iArgs.pop();

        var _Not_ = iArgs.shift(),  _Reverse_ = iArgs[0];

        return  function ($_Filter) {

            var $_Result = this;

            if (CoreBack)  $_Result = this.map( CoreBack );

            if ($.isNumeric( $_Filter ))
                $_Result = $_Result.map(function () {

                    return  (this.nodeType == $_Filter)  ?  this  :  null;
                });
            else if ($_Filter)
                $_Result = $_Result.map(function () {

                    var _Is_ = $( this ).is( $_Filter );

                    return  (_Not_  ?  (! _Is_)  :  _Is_)  ?  this  :  null;
                });

            return  _Reverse_  ?  Array_Reverse.call( $_Result )  :  $_Result;
        };
    }

    $.fn.extend({
        is:              function ($_Match) {

            var iPath = (typeof $_Match == 'string'),
                iCallback = (typeof $_Match == 'function'),
                iMatch = (typeof Element.prototype.matches == 'function');

            for (var i = 0;  this[i];  i++) {
                if ((this[i] === $_Match)  ||  (
                    iCallback  &&  $_Match.call(this[i], i)
                ))
                    return true;

                if (iPath && iMatch)  try {

                    if (this[i].matches( $_Match ))  return true;

                } catch (iError) { }

                if ((this[i].nodeType < 9)  &&  (! this[i].parentElement))
                    $('<div />')[0].appendChild( this[i] );

                if (-1  <  $.inArray(this[i], (
                    iPath  ?  $($_Match, this[i].parentNode)  :  $($_Match)
                )))
                    return true;
            }

            return false;
        },
        add:                function () {
            return  this.pushStack( $.merge(this,  $.apply(BOM, arguments)) );
        },
        filter:          DOM_Map(),
        not:             DOM_Map(true),
        addBack:         function (not) {

            var $_This = $.merge(this, this.prevObject);

            return  this.pushStack(not  ?  $_This.not( not )  :  $_This);
        },
        parent:          DOM_Map(function () {

            return this.parentElement;
        }),
        parents:         DOM_Map('',  true,  function () {

            return  $.trace(this, 'parentElement');
        }),
        parentsUntil:    function () {

            return  Array_Reverse.call(
                this.parents().not( $( arguments[0] ).parents().addBack() )
            );
        },
        children:        DOM_Map(function () {

            return  $.makeArray( this.children );
        }),
        contents:        DOM_Map(function () {

            switch ( this.tagName.toLowerCase() ) {
                case 'iframe':
                    return this.contentWindow.document;
                case 'template':
                    var iDOM = this.content || this;
                default:
                    return  $.makeArray( (iDOM || this).childNodes );
            }
        }),
        prev:            DOM_Map(function () {

            return this.previousElementSibling;
        }),
        prevAll:         DOM_Map('',  true,  function () {

            return  $.trace(this, 'previousElementSibling');
        }),
        next:               DOM_Map(function () {

            return this.nextElementSibling;
        }),
        nextAll:         DOM_Map(function () {

            return  $.trace(this, 'nextElementSibling');
        }),
        siblings:        function () {

            var $_Result = this.prevAll().add( this.nextAll() );

            return this.pushStack(
                arguments[0]  ?  $_Result.filter( arguments[0] )  :  $_Result
            );
        },
        offsetParent:    DOM_Map(function () {  return this.offsetParent;  }),
        find:               function () {
            var $_Result = [ ];

            for (var i = 0;  this[i];  i++)
                $_Result = $.merge($_Result,  $.find(arguments[0], this[i]));

            return  this.pushStack( $_Result );
        },
        has:                function ($_Filter) {

            if (typeof $_Filter != 'string') {

                var _UUID_ = $.uuid('Has');

                $( $_Filter ).addClass(_UUID_);

                $_Filter = '.' + _UUID_;
            }

            return  this.map(function () {

                if ( $($_Filter, this).removeClass(_UUID_).length )
                    return this;
            });
        }
    });
});