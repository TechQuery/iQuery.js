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

        this.length = 0;
        this.$_View = iListView.$_View;

        this.unit = iListView.on('insert',  function ($_Item, iValue) {
            var iParent = this;

            if ($.likeArray( iValue[iKey] )  &&  iValue[iKey][0])
                $.wait(0.01,  function () {
                    _This_.branch(iParent.fork($_Item), iValue[iKey]);
                });
        });

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

                $('.ListView_Item.active', _This_.unit.$_View[0]).not(this)
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

    TreeView.getInstance = $.CommonView.getInstance;

    TreeView.prototype = $.extend(new $.CommonView(),  {
        constructor:    TreeView,
        render:         function ($_Fork, iData) {
            if (iData  ||  (! ($_Fork instanceof Array)))
                $_Fork = $($_Fork);
            else {
                iData = $_Fork;
                $_Fork = this.unit.$_View;
            }

            $.ListView.getInstance( $_Fork ).render(
                iData || $_Fork.data('TV_Model')
            ).$_View.children().removeClass('active');

            return this;
        },
        clear:          function () {
            this.unit.clear();

            return this;
        },
        branch:         function ($_Item, iData) {
            var iFork = ($_Item instanceof $.ListView)  ?  $_Item  :  (
                    $.ListView.getInstance( $_Item[0].parentNode ).fork( $_Item )
                );
            this.length = Math.max(
                this.length,  $.trace(iFork, 'parentView').length + 1
            );
            iFork.clear();

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
            return this.unit.valueOf();
        }
    });

    $.TreeView = TreeView;

});