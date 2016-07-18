/* ---------- TreeView Interface  v0.4 ---------- */

define(['jquery', 'ListView'],  function ($) {

    function TreeView(iListView, iKey, Init_Depth, onFork, onFocus) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_(iListView, iKey, Init_Depth, onFork, onFocus);

        var iArgs = $.makeArray( arguments ).slice(1);

        iKey = (typeof iArgs[0] == 'string')  ?  iArgs.shift()  :  'list';
        this.initDepth = (typeof iArgs[0] == 'number')  ?
            iArgs.shift()  :  Infinity;

        var _This_ = $.CommonView.call(this, iListView.$_View)
                .on('branch',  (typeof iArgs[0] == 'function')  &&  iArgs.shift());

        this.depth = 0;
        onFocus = iArgs[0];

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

                if (typeof onFocus != 'function')  return;

                var $_Target = onFocus.apply(this, arguments);

                if ($_Target && _This_.$_Content) {
                    _This_.$_Content.scrollTo( $_Target );
                    return false;
                }
            }
        ];
        $.fn.on.apply(iListView.$_View.addClass('TreeNode'), this.listener);
    }

    TreeView.getInstance = $.CommonView.getInstance;

    TreeView.prototype = $.extend(new $.CommonView(),  {
        constructor:    TreeView,
        render:         function ($_Fork, iData) {
            $_Fork = $($_Fork);

            $.ListView.getInstance( $_Fork ).render(
                iData || $_Fork.data('TV_Model')
            ).$_View.children().removeClass('active');

            return this;
        },
        branch:         function (iFork, iData) {
            this.depth = Math.max(
                this.depth,  $.trace(iFork, 'parentView').length + 1
            );
            iFork.clear();

            if (this.initDepth < this.depth) {
                iFork.$_View.data('TV_Model', iData);
                iData = null;
            } else
                this.render(iFork.$_View, iData);

            this.trigger('branch',  [iFork, this.depth, iData]);

            $.fn.off.apply(iFork.$_View.addClass('TreeNode'), this.listener);

            return iFork;
        },
        bind:           function ($_Item, Depth_Sort, Data_Filter) {
            this.$_Content = $_Item.sameParents().eq(0);
            this.data = [ ];

            for (
                var  i = 0,  _Tree_ = this.data,  _Level_ = 0,  _Parent_;
                i < $_Item.length;
                i++
            ) {
                if (i > 0)
                    _Level_ = Depth_Sort.call(this,  $_Item[i - 1],  $_Item[i]);

                if (_Level_ > 0)
                    _Tree_ = _Tree_.slice(-1)[0].list = $.extend([ ], {
                        parent:    _Tree_
                    });
                else if (_Level_ < 0) {
                    _Parent_ = _Tree_.parent;
                    delete _Tree_.parent;
                    _Tree_ = _Parent_;
                }
                _Tree_.push( Data_Filter.call($_Item[i]) );
            }

            this.unit.clear().render( this.data );

            return this;
        },
        linkage:        function ($_Scroll, onScroll) {
            var _DOM_ = $_Scroll[0].ownerDocument;

            $_Scroll.scroll(function () {
                if (arguments[0].target !== this)  return;

                var iAnchor = $_Scroll.offset(),
                    iFontSize = $(_DOM_.body).css('font-size') / 2;

                var $_Anchor = $(_DOM_.elementFromPoint(
                        iAnchor.left + $_Scroll.css('padding-left') + iFontSize,
                        iAnchor.top + $_Scroll.css('padding-top') + iFontSize
                    ));
                return  onScroll.call(this, $_Anchor);
            });

            return this;
        }
    });

    $.TreeView = TreeView;

});