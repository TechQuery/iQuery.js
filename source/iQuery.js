define([
    './object/index', './CSS/pseudo', './DOM/uniqueSort', './DOM/parseHTML'
],  function (ObjectKit, selector, uniqueSort, parseHTML) {

    /**
     * HTML 元素标签抽象类
     *
     * @typedef {HTMLElement} HTMLElement
     *
     * @see     {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement|HTMLElement}
     */

    /**
     * jQuery 构造函数 第一参数接受的数据类型
     *
     * @typedef {(string|HTMLElement|HTMLElement[]|jQuery|$)} jQueryAcceptable
     *
     * @see     {@link https://api.jquery.com/jQuery|jQuery Acceptable}
     */

    /**
     * iQuery 对象构造函数
     *
     * @author  TechQuery
     *
     * @class
     * @alias   $
     *
     * @param   {jQueryAcceptable}   [Element_Set]
     * @param   {HTMLElement|object} [context]     Selector context DOM or
     *                                             Element Constructor property
     * @returns {$}                  Array-Like object
     *
     * @see {@link http://www.jquery123.com/jQuery/|jQuery constructor}
     */

    function iQuery(Element_Set, context) {

        /* ----- Global Wrapper ----- */

        if (! (this instanceof iQuery))
            return  new iQuery(Element_Set, context);

        this.length = 0;

        if ((! Element_Set)  ||  (Element_Set instanceof iQuery))
            return Element_Set;

        /* ----- Constructor ----- */

        switch ($.Type( Element_Set )) {
            case 'String':
                Element_Set = this.init(Element_Set, context);    break;
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


    $.fn.init = function (Element_Set, context) {

        Element_Set = Element_Set.trim();

    //  Search DOM

        if (Element_Set[0] != '<') {

            this.context = context || document;

            this.selector = Element_Set;

            Element_Set = $.find(Element_Set, this.context);

            return  (Element_Set.length < 2)  ?
                Element_Set  :  $.uniqueSort( Element_Set );
        }

    //  Create DOM

        Element_Set = $.map($.parseHTML( Element_Set ),  function (node) {

            if (node.nodeType === 1)  return node;
        });

        if ((Element_Set.length == 1)  &&  $.isPlainObject( context ))
            for (var key in context) {
                if (typeof this[key] === 'function')
                    $( Element_Set[0] )[key]( context[key] );
                else
                    $( Element_Set[0] ).attr(key, context[key]);
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
        index:        function (target) {
            if (! target)
                return  $.trace(this[0], 'previousElementSibling').length;

            var type = $.Type( target );

            if (type === 'String')
                return  $.inArray(this[0],  $( target ));

            if ($.likeArray( target )  &&  (! (type in DOM_Type))) {

                target = target[0];

                type = $.Type( target );
            }

            return  (type in DOM_Type)  ?  $.inArray(target, this)  :  -1;
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
