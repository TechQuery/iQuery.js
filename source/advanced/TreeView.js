/* ---------- TreeView Interface  v0.2 ---------- */

define(['jquery', 'ListView'],  function ($) {

    function TreeView(iListView, iKey, Init_Depth, onFork) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_(iListView, iKey, Init_Depth, onFork);

        var iArgs = $.makeArray( arguments ).slice(1);

        iKey = (typeof iArgs[0] == 'string')  ?  iArgs.shift()  :  'list';
        this.initDepth = (typeof iArgs[0] == 'number')  ?
            iArgs.shift()  :  Infinity;

        var _This_ = $.CommonView.call(this, iListView.$_View)
                .on('branch',  (typeof iArgs[0] == 'function')  &&  iArgs[0]);

        this.$_View = iListView.$_View;

        this[0] = [iListView.on('insert',  function ($_Item, iValue) {
            var iParent = this;

            if ($.likeArray( iValue[iKey] )  &&  iValue[iKey][0])
                $.wait(0.01,  function () {
                    _This_.branch(iParent.fork($_Item), iValue[iKey]);
                });
        })];
        this.length = 1;

        this.listener = [
            $.browser.mobile ? 'tap' : 'click',
            iListView.getSelector(),
            function (iEvent) {
                if ( $(iEvent.target).is(':input') )  return;

                var $_Fork = $(this).children('.TreeNode');

                if (iEvent.isPseudo() && $_Fork[0]) {
                    if ( $_Fork[0].firstElementChild )
                        $_Fork.toggle(200);
                    else
                        _This_.render($_Fork);
                }

                $('.ListView_Item.active', _This_.$_View[0]).not(this)
                    .removeClass('active');

                _This_.trigger('focus', arguments);

                return (
                    (iEvent.target.tagName != 'A')  ||
                    (iEvent.target.getAttribute('href')[0] != '#')
                );
            }
        ];
        $.fn.on.apply(iListView.$_View.addClass('TreeNode'), this.listener);
    }

    $.extend(TreeView, {
        getClass:       $.CommonView.getClass,
        getInstance:    $.CommonView.getInstance,
        instanceOf:     $.CommonView.instanceOf
    });

    TreeView.prototype = $.extend(new $.CommonView(),  {
        constructor:    TreeView,
        render:         function ($_Fork, iData) {
            if (iData  ||  (! ($_Fork instanceof Array)))
                $_Fork = $($_Fork);
            else {
                iData = $_Fork;
                $_Fork = this.$_View;
            }

            $.ListView.getInstance( $_Fork ).render(
                iData || $_Fork.data('TV_Model')
            ).$_View.children().removeClass('active');

            return this;
        },
        clear:          function () {
            this[0][0].clear();

            return this;
        },
        branch:         function ($_Item, iData) {
            var iFork = ($_Item instanceof $.ListView)  ?  $_Item  :  (
                    $.ListView.getInstance( $_Item[0].parentNode ).fork( $_Item )
                );
            var iDepth = $.trace(iFork, 'parentView').length;

            if (! this[iDepth])  this[this.length++] = [ ];

            this[iDepth].push( iFork.clear() );

            if (this.initDepth < this.length) {
                iFork.$_View.data('TV_Model', iData);
                iData = null;
            } else
                this.render(iFork.$_View, iData);

            this.trigger('branch',  [iFork, this.length, iData]);

            $.fn.off.apply(iFork.$_View.addClass('TreeNode'), this.listener);

            return iFork;
        },
        valueOf:        function () {
            return this[0][0].valueOf();
        }
    });

    $.TreeView = TreeView;

});