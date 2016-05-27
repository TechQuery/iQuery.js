/* ---------- ListView Interface  v0.7 ---------- */

//  Thanks "EasyWebApp" Project --- http://git.oschina.net/Tech_Query/EasyWebApp

define(['jquery', 'jQuery+'],  function ($) {

    var Click_Type = $.browser.mobile ? 'tap' : 'click';

    function ListView($_View, $_Item, onInsert) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, $_Item, onInsert);

        $_View = $($_View);
        if (typeof $_Item == 'function') {
            onInsert = $_Item;
            $_Item = null;
        }

        var iView = _Self_.getInstance($_View) || $.Observer.call(this, 1);

        if (onInsert)  iView.on('insert', onInsert);

        if (iView !== this)  return iView;

        this.$_View = $_View.data('_LVI_', this);

        this.selector = $_Item;
        this.length = 0;

        for (;  ;  this.length++) {
            $_Item = this.itemOf(this.length);

            if (! $_Item.length)  break;

            this[this.length] = $_Item;
        }

        _Self_.findView(this.$_View, false);

        this.$_Template = this[0].clone(true);

        this.$_View.on(Click_Type,  '.ListView_Item',  function (iEvent) {
            var $_This = $(this);

            if (
                (! $_This.hasClass('active'))  &&
                $_This.scrollParents().is(
                    'a[href], *[tabIndex], *[contentEditable]'
                )
            )
                _Self_.getInstance(this.parentNode).focus(this);
        });
    }

    $.extend(ListView, {
        getInstance:    function () {
            var _Instance_ = $(arguments[0]).data('_LVI_');
            return  ((_Instance_ instanceof this)  &&  _Instance_);
        },
        findView:       function ($_View, Init_Instance) {
            $_View = $($_View).find(
                'ul, ol, dl, tbody, select, datalist, *[multiple]'
            ).not('input[type="file"]');

            if (Init_Instance === true) {
                for (var i = 0;  i < $_View.length;  i++)
                    if (! this.getInstance($_View[i]))  this( $_View[i] );
            } else if (Init_Instance === false)
                $_View.data('_LVI_', null);

            return $_View;
        }
    });

    function New_Item($_Item, Index) {
        var $_Clone = this.$_Template.clone(true);

        if (! Index)
            this.$_View.prepend($_Clone);
        else {
            if (! $_Item.length)
                this.itemOf(Index - 1).slice(-1).after($_Clone);
            else
                $_Item.eq(0).before($_Clone);
        }

        return $_Clone;
    }

    ListView.prototype = $.extend(new $.Observer(),  {
        constructor:    ListView,
        getSelector:    function () {
            return  this.selector ?
                this.selector.join(', ') : [
                    this.$_Template[0].tagName.toLowerCase()
                ].concat(
                    (this.$_Template.attr('class') || '').split(/\s+/)
                ).join('.').trim('.');
        },
        itemOf:         function (Index) {
            Index = Index || 0;

            var _This_ = this,  $_Item = this.$_View[0].children[Index];

            return $(
                this.selector ?
                    $.map(this.selector,  function () {
                        return  _This_.$_View.children( arguments[0] )[Index];
                    }) :
                    ($_Item ? [$_Item] : [ ])
            );
        },
        slice:          Array.prototype.slice,
        indexOf:        function (Index, getInstance) {
            if (! isNaN(Number( Index )))
                return  this.slice(Index,  (Index + 1) || undefined)[0];

            var $_Item = $(Index);

            for (var i = 0;  i < this.length;  i++)
                if (this[i].index($_Item[0]) > -1)
                    return  getInstance  ?  arguments.callee.call(this, i)  :  i;

            return  getInstance ? $() : -1;
        },
        splice:         Array.prototype.splice,
        insert:         function (iValue, Index) {
            iValue = (iValue === undefined)  ?  { }  :  iValue;

            Index = parseInt(Index) || 0;
            Index = (Index < this.length)  ?  Index  :  this.length;

            var $_Item = this.itemOf(Index);
            var _Insert_ = (
                    (! $_Item.length)  ||  $_Item.hasClass('ListView_Item')
                );
            if (_Insert_)  $_Item = New_Item.call(this, $_Item, Index);

            var _Index_ = (Index < 0)  ?  (Index - 1)  :  Index;

            var iReturn = this.trigger('insert',  [$_Item, iValue, _Index_]);

            if (_Insert_) {
                $_Item = this.itemOf(_Index_);
                this.splice(Index, 0, $_Item);
            }
            iValue = (iReturn === undefined) ? iValue : iReturn;

            $_Item.addClass('ListView_Item').data('LV_Model', iValue);

            return this.indexOf(_Index_);
        },
        render:         function (iData) {
            iData = $.likeArray(iData) ? iData : [iData];

            for (var i = 0;  i < iData.length;  i++)
                this.insert(iData[i], i);

            this.trigger('afterRender', [iData]);

            return this;
        },
        valueOf:        function (Index) {
            if (Index  ||  (Index == 0))
                return  this.indexOf(arguments[0], true).data('LV_Model');

            var iData = this.$_View.data('LV_Model') || [ ];

            if (! iData[0]) {
                for (var i = 0;  i < this.length;  i++)
                    iData.push( this[i].data('LV_Model') );

                this.$_View.data('LV_Model', iData);
            }
            return iData;
        },
        remove:         function (Index) {
            var $_Item = this.indexOf(Index);

            if (typeof $_Item == 'number') {
                if ($_Item < 0)  return this;
                Index = $_Item;
                $_Item = this.indexOf(Index);
            }
            if (
                $_Item.length  &&
                (false  !==  this.trigger('remove', [
                    $_Item,  this.valueOf(Index),  Index
                ]))
            )
                this.splice(Index, 1)[0].remove();

            return this;
        },
        clear:          function () {
            this.splice(0, this.length);
            this.$_View.empty();

            return this;
        },
        focus:          function () {
            var $_Item = this.indexOf(arguments[0], true);

            if ( $_Item[0] ) {
                $_Item.siblings().removeClass('active');
                $_Item.scrollParents().eq(0).focus().scrollTo(
                    $_Item.addClass('active')
                );
            }
            return this;
        },
        sort:           function (iCallback) {
            var iLV = this;

            Array.prototype.sort.call(
                iLV,
                function ($_A, $_B) {
                    return  iCallback.apply(iLV, [
                        $_A.data('LV_Model'),  $_B.data('LV_Model'),  $_A,  $_B
                    ]);
                }
            );
            Array.prototype.unshift.call(iLV, [ ]);

            $($.merge.apply($, iLV)).detach().appendTo( iLV.$_View );

            Array.prototype.shift.call( iLV );

            return iLV;
        },
        fork:           function () {
            var $_View = this.$_View.clone(true);

            $_View.data({_LVI_: '',  LV_Model: ''})[0].id = '';

            var iFork = ListView($_View.appendTo( arguments[0] ),  this.selector);
            iFork.$_Template = this.$_Template.clone(true);
            iFork.table = this.table;

            return iFork;
        }
    });

    $.ListView = ListView;

});