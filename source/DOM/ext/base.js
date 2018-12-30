define(['../../iQuery', '../utility'],  function ($) {

    /**
     * HTML 文档片段类
     *
     * @typedef {DocumentFragment} DocumentFragment
     *
     * @see     {@link https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment|Document Fragment}
     */

    /**
     * 构造文档片段
     *
     * @memberof $
     * @function buildFragment
     *
     * @param    {Node|ArrayLike}   node - Child Nodes
     *
     * @return   {DocumentFragment}
     */

    $.buildFragment = $.buildFragment  ||  function (node) {

        node = $.makeArray( node );

        var fragment = (arguments[1] || document).createDocumentFragment();

        for (var i = 0;  node[i];  i++)  fragment.appendChild( node[i] );

        return fragment;
    };

    /**
     * 任意索引位置 插入子节点
     *
     * @author TechQuery
     *
     * @memberof $.prototype
     * @function insertTo
     *
     * @param {jQueryAcceptable} $_Target
     * @param {number}           [index=0] Position index of `$_Target`'s
     *                                     child Elements
     *
     * @return {$}               All the Elements inserted
     *
     * @example  // 插入到最前
     *
     *     $('<a>insert</a>').insertTo('body')  &&  (
     *         $('body > :first-child')[0].textContent
     *     )
     *
     *     // 'insert'
     *
     * @example  // 插入到最后
     *
     *     $('<a>insert</a>').insertTo('body', Infinity)  &&  (
     *         $('body > :last-child')[0].textContent
     *     )
     *
     *     // 'insert'
     */

    $.fn.insertTo = function ($_Target, index) {

        var DOM_Set = $.buildFragment(this, document),  $_This = [ ];

        $( $_Target ).each(function () {

            DOM_Set = arguments[0]  ?  DOM_Set.cloneNode( true )  :  DOM_Set;

            $.merge($_This, DOM_Set.children);

            this.insertBefore(DOM_Set,  this.children[index || 0]);
        });

        return  this.pushStack( $_This );
    };

    /**
     * HTML 执行器
     *
     * @author TechQuery
     *
     * @memberof $.prototype
     * @function htmlExec
     *
     * @param {string} HTML       HTML source code with scripts executable
     * @param {string} [selector] CSS selector to filter
     *                            without scripts executable
     *
     * @return {$}     Element set of HTML source code
     *
     * @example  // 同步执行脚本
     *
     *     $('body').htmlExec(
     *         "<script>self.test = $('body')[0].lastChild.tagName;</script>xxx"
     *     ) && self.test
     *
     *     // 'SCRIPT'
     *
     * @example  // CSS 选择符不执行脚本
     *
     *     $('body').htmlExec(
     *         "<script>self.name = 'xxx';</script><a /><b />",  'script, a'
     *     ) && (
     *         self.name + $('body')[0].children.length
     *     )
     *
     *     // '2'
     */

    $.fn.htmlExec = function (HTML, selector) {

        this.empty();

        var $_Box = $('<div />').prop('innerHTML', HTML);

        return  (! selector)  ?
            this.each(function () {

                $_Box = $( $_Box[0].cloneNode( true ) );

                $.mapTree($_Box[0],  'childNodes',  function (child) {

                    if (child.nodeName.toLowerCase() !== 'script')
                        return child;

                    var attribute = { };

                    $.each(child.attributes,  function () {

                        attribute[ this.nodeName ] = this.nodeValue;
                    });

                    $('<script />',  attribute).prop('text', child.text)
                        .replaceAll( child );
                });

                $_Box.children().insertTo( this );
            })  :
            $_Box.find( selector ).insertTo( this );
    };

});
