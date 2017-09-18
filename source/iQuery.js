define([
    './object/index', './CSS/pseudo', './DOM/uniqueSort', './DOM/parseHTML'
],  function (ObjectKit, selector, uniqueSort, parseHTML) {

/* ---------- jQuery Object Core ---------- */

    function iQuery(Element_Set, iContext) {

        /* ----- Global Wrapper ----- */

        if (! (this instanceof iQuery))
            return  new iQuery(Element_Set, iContext);

        this.length = 0;

        if ((! Element_Set)  ||  (Element_Set instanceof iQuery))
            return Element_Set;

        /* ----- Constructor ----- */

        switch ($.Type( Element_Set )) {
            case 'String':
                Element_Set = this.init(Element_Set, iContext);    break;
            case 'Window':         ;
            case 'Document':       ;
            case 'HTMLElement':
                Element_Set = [ Element_Set ];
        }

        $.merge(
            this,  $.likeArray( Element_Set )  ?  Element_Set  :  [ Element_Set ]
        );

        if (this.length < 2)  this.context = (this[0] || '').ownerDocument;
    }

    /* ----- iQuery Static Method ----- */

    var $ = iQuery;    $.fn = $.prototype;

    ObjectKit.extend(true, $, ObjectKit, selector, {
        uniqueSort:    uniqueSort,
        parseHTML:     parseHTML
    });

    $.fn.extend = $.extend;    $.fn.jquery = '3.2.1';


    $.fn.init = function (Element_Set, iContext) {

        Element_Set = Element_Set.trim();

    //  Search DOM

        if (Element_Set[0] != '<') {

            this.context = iContext || document;

            this.selector = Element_Set;

            Element_Set = $.find(Element_Set, this.context);

            return  (Element_Set.length < 2)  ?
                Element_Set  :  $.uniqueSort( Element_Set );
        }

    //  Create DOM

        Element_Set = $.map($.parseHTML( Element_Set ),  function () {

            if (arguments[0].nodeType == 1)  return arguments[0];
        });

        if ((Element_Set.length == 1)  &&  $.isPlainObject( iContext ))
            for (var iKey in iContext) {
                if (typeof this[iKey] == 'function')
                    $( Element_Set[0] )[iKey]( iContext[iKey] );
                else
                    $( Element_Set[0] ).attr(iKey, iContext[iKey]);
            }

        return Element_Set;
    };

    /* ----- iQuery Instance Method ----- */

    var DOM_Type = $.makeSet('Window', 'Document', 'HTMLElement');

    $.fn.extend({
        splice:       Array.prototype.splice,
        pushStack:    function ($_New) {

            $_New = $($.uniqueSort(
                ($_New instanceof Array)  ?  $_New  :  $.makeArray( $_New )
            ));
            $_New.prevObject = this;

            return $_New;
        },
        index:        function (iTarget) {
            if (! iTarget)
                return  $.trace(this[0], 'previousElementSibling').length;

            var iType = $.Type( iTarget );

            if (iType === 'String')
                return  $.inArray(this[0],  $( iTarget ));

            if ($.likeArray( iTarget )  &&  (! (iType in DOM_Type))) {

                iTarget = iTarget[0];

                iType = $.Type( iTarget );
            }

            return  (iType in DOM_Type)  ?  $.inArray(iTarget, this)  :  -1;
        },
        each:         function () {

            return  $.each(this, arguments[0]);
        },
        map:          function (filter) {

            return  this.pushStack($.map(this,  function (DOM, index) {

                return  filter.call(DOM, index, DOM);
            }));
        }
    });

    return $;

});
