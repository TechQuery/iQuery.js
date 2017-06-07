define(['extension/iPseudo'],  function ($) {

    var Array_Reverse = Array.prototype.reverse;

    function DOM_Map() {

        var iArgs = $.makeArray( arguments );

        var CoreBack = (typeof iArgs.slice(-1)[0] == 'function')  &&  iArgs.pop();

        var _Not_ = iArgs.shift(),  _Reverse_ = iArgs[0];

        return  function ($_Filter) {

            var $_Result = this;

            if (CoreBack)  $_Result = $.map($_Result, CoreBack);

            if ($.isNumeric( $_Filter ))
                $_Result = $.map($_Result,  function (iDOM) {

                    return  (iDOM.nodeType == $_Filter)  ?  iDOM  :  null;
                });
            else if ($_Filter)
                $_Result = $.map($_Result,  function (iDOM) {

                    var _Is_ = $( iDOM ).is( $_Filter );

                    return  (_Not_  ?  (! _Is_)  :  _Is_)  ?  iDOM  :  null;
                });

            $_Result = this.pushStack( $_Result );

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
        addBack:         function () {
            return  this.pushStack( $.merge(this, this.prevObject) );
        },
        filter:          DOM_Map(),
        not:             DOM_Map(true),
        parent:          DOM_Map(function (iDOM) {

            return iDOM.parentElement;
        }),
        parents:         DOM_Map('',  true,  function (iDOM) {

            return  $.trace(iDOM, 'parentElement').slice(0, -1);
        }),
        parentsUntil:    function () {

            return  Array_Reverse.call(
                this.parents().not( $( arguments[0] ).parents().addBack() )
            );
        },
        children:        DOM_Map(function (iDOM) {

            return  $.makeArray( iDOM.children );
        }),
        contents:        DOM_Map(function (iDOM) {

            switch ( iDOM.tagName.toLowerCase() ) {
                case 'iframe':      return iDOM.contentWindow.document;
                case 'template':    iDOM = iDOM.content || iDOM;
                default:            return $.makeArray( iDOM.childNodes );
            }
        }),
        prev:            DOM_Map(function (iDOM) {

            return iDOM.previousElementSibling;
        }),
        prevAll:         DOM_Map('',  true,  function (iDOM) {

            return  $.trace(iDOM, 'previousElementSibling');
        }),
        next:               DOM_Map(function (iDOM) {

            return iDOM.nextElementSibling;
        }),
        nextAll:         DOM_Map(function (iDOM) {

            return  $.trace(iDOM, 'nextElementSibling');
        }),
        siblings:        function () {
            var $_Result = this.prevAll().add( this.nextAll() );

            return this.pushStack(
                arguments[0]  ?  $_Result.filter(arguments[0])  :  $_Result
            );
        },
        offsetParent:    DOM_Map(function (iDOM) {

            return iDOM.offsetParent;
        }),
        find:               function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $.merge($_Result,  $.find(arguments[0], this[i]));

            return  this.pushStack( $_Result );
        },
        has:                function ($_Filter) {

            if (typeof $_Filter != 'string') {
                var _UUID_ = $.uuid('Has');

                $( $_Filter ).addClass(_UUID_);

                $_Filter = '.' + _UUID_;
            }

            return  this.pushStack($.map(this,  function () {

                if ( $($_Filter, arguments[0]).removeClass(_UUID_).length )
                    return arguments[0];
            }));
        }
    });
});