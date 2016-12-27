/* ---------- ListView Interface  v0.8 ---------- */

//  Thanks "EasyWebApp" Project --- http://git.oschina.net/Tech_Query/EasyWebApp

define(['jquery', 'CommonView'],  function ($) {

    var Click_Type = $.browser.mobile ? 'tap' : 'click';

    function ListView($_View, $_Item, onUpdate) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, $_Item, onUpdate);

        var iArgs = $.makeArray(arguments).slice(1);

        $_Item = (iArgs[0] instanceof Array)  &&  iArgs.shift();

        var iView = $.CommonView.call(this, $_View).on('update', iArgs[0]);

        if ((iView !== this)  ||  (! iView.$_View.children()[0]))
            return iView;

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

            if (iView.$_View[0] !== this.parentNode)  return;

            var $_Focus = $( iEvent.target );

            if (! $_Focus.is(':data("TV_Focused")'))
                $_Focus = $_Focus.parents(':data("TV_Focused")').eq(0);

            if ( $_Focus.data('TV_Focused') )
                return  $_Focus.data('TV_Focused', null);

            var $_This = $(this);

            if (
                (! $_This.hasClass('active'))  &&
                $_This.scrollParents().is(
                    'a[href], *[tabIndex], *[contentEditable]'
                )
            ) {
                _Self_.instanceOf(this).focus(this);

                $_This.data('TV_Focused', 1);
            }
        });

        return this;
    }

    var $_DOM = $(DOM);

    return  $.ListView = $.inherit($.CommonView, ListView, {
        findView:    function ($_View, Init_Instance) {
            $_View = $( $_View ).find(':list, :data("' + this.getClass() + '")');

            if (Init_Instance === true) {

                for (var i = 0;  $_View[i];  i++)
                    if (! this.instanceOf($_View[i], false))
                        this( $_View[i] );

            } else if (Init_Instance === false)
                $_View.data(this.getClass(), null);

            return $_View;
        }
    }, {
        getSelector:    function () {
            return  this.selector ?
                this.selector.join(', ') : [
                    this.$_Template[0].tagName.toLowerCase()
                ].concat(
                    (this.$_Template.attr('class') || '').split(/\s+/)
                ).join('.').trim('.');
        },
        //  Retrieve
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
        //  Retrieve
        indexOf:        function (Index, getInstance) {
            if ($.isNumeric( Index ))
                return  this.slice(Index,  (Index + 1) || undefined)[0];

            var $_Item = $(Index);

            for (var i = 0;  i < this.length;  i++)
                if (this[i].index($_Item[0]) > -1)
                    return  getInstance  ?  arguments.callee.call(this, i)  :  i;

            return  getInstance ? $() : -1;
        },
        //  Update
        update:         function () {
            var $_Item = this.indexOf(arguments[0], true);

            this.trigger('update', [
                $_Item,  arguments[1],  this.indexOf($_Item)
            ]);

            return this;
        },
        splice:         Array.prototype.splice,
        //  Create
        insert:         function (iValue, Index) {
            iValue = (iValue === undefined)  ?  { }  :  iValue;

            Index = Math.min(parseInt(Index) || 0,  this.length);
            Index = (Index < 0)  ?  (this.length - Index)  :  Index;

            var $_Item = this.itemOf(Index);

            var _New_ = (! $_Item.length)  ||  $_Item.hasClass('ListView_Item');

            $_Item = _New_ ? this.$_Template.clone(true) : $_Item;

            var iReturn = this.trigger('insert',  [$_Item, iValue, Index]);

            $_Item = iReturn.length  ?
                $([ ].concat.apply([ ], iReturn))  :  $_Item;

            if (_New_)
                this.splice(Index, 0, $_Item);
            else
                this[Index] = $_Item;

            this.update(Index, iValue);

            return  $_Item.addClass('ListView_Item').data('LV_Model', iValue)
                .insertTo(this.$_View,  Index * $_Item.length);
        },
        render:         function (iData, iFrom) {
            iFrom = iFrom || 0;

            for (var i = 0;  i < iData.length;  i++)
                this.insert(iData[i],  i + iFrom);

            if ( iData.length )  this.trigger('afterRender', [iData]);

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
        //  Delete
        remove:         function (Index) {
            Index = $.isNumeric(Index) ? Index : this.indexOf(Index);

            var $_Item = this.indexOf(Index, true);

            if (
                $_Item.length  &&
                (false  !==  this.trigger('remove', [
                    $_Item,  this.valueOf(Index),  Index
                ])[0])
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

            Array.prototype.sort.call(iLV,  function ($_A, $_B) {
                if (typeof iCallback == 'function')
                    return  iCallback.apply(iLV, [
                        $_A.data('LV_Model'),  $_B.data('LV_Model'),  $_A,  $_B
                    ]);

                var A = $_A.text(),  B = $_B.text();
                var nA = parseFloat(A),  nB = parseFloat(B);

                return  (isNaN(nA) || isNaN(nB))  ?
                    A.localeCompare(B)  :  (nA - nB);
            });

            Array.prototype.unshift.call(iLV, [ ]);

            $($.merge.apply($, iLV)).detach().appendTo( iLV.$_View );

            Array.prototype.shift.call( iLV );

            return iLV;
        },
        fork:           function () {
            var iFork = ListView(
                    this.$_View.clone(true)
                        .removeAttr('id style')
                        .data({
                            '[object ListView]':    '',
                            LV_Model:               ''
                        })
                        .empty().append( this.$_Template.clone(true) )
                        .appendTo( arguments[0] ),
                    false,
                    this.selector
                );
            iFork.table = this.table;
            iFork.parentView = this;

            return iFork;
        }
    });
});