define(['jquery'],  function ($) {

    $.fn.insertTo = function ($_Target, Index) {
        var DOM_Set = DOM.createDocumentFragment(),  $_This = [ ];

        for (var i = 0;  this[i];  i++)
            DOM_Set.appendChild( this[i] );

        $($_Target).each(function () {
            var iAfter = $(this.children).eq(Index || 0)[0];

            DOM_Set = arguments[0] ? DOM_Set.cloneNode(true) : DOM_Set;

            $.merge($_This, DOM_Set.children);

            this[iAfter ? 'insertBefore' : 'appendChild'](DOM_Set, iAfter);
        });

        return this.pushStack($_This);
    };

});