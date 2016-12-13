(function () {

    if ((typeof this.define != 'function')  ||  (! this.define.amd))
        arguments[0]();
    else
        this.define('iQuery+', ['jQuery+'], arguments[0]);

})(function () {


(function (BOM, DOM, $) {

    function CommonView($_View, onInit) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, onInit);

        $_View = $($_View);

        var iView = this.constructor.instanceOf($_View, false)  ||
                $.Observer.call(this, 1);

        if (iView !== this)  return iView;

        this.$_View = $_View.data(this.constructor.getClass(), this);

        if (typeof onInit == 'function')  onInit.call(this);

        return this;
    }

    return  $.CommonView = $.inherit($.Observer, CommonView, {
        getClass:      function () {
            return  this.prototype.toString.call({constructor: this});
        },
        instanceOf:    function (iDOM, Check_Parent) {
            var iName = this.getClass(),  _Instance_,  $_Instance = $(iDOM);

            do {
                _Instance_ = $_Instance.data(iName);

                if (_Instance_ instanceof this)  return _Instance_;

                $_Instance = $_Instance.parent();

            } while ($_Instance[0]  &&  (Check_Parent !== false));
        }
    }, {
        toString:    function () {
            var iName = this.constructor.name;

            iName = (typeof iName == 'function')  ?  this.constructor.name()  :  iName;

            return  '[object ' + iName + ']';
        },
        render:      function () {
            this.trigger('render', arguments);

            return this;
        },
        valueOf:     function () {
            return $.map(
                this.$_View.find('*').addBack().filter('form'),
                function () {
                    return  $.paramJSON('?'  +  $( arguments[0] ).serialize());
                }
            );
        },
        clear:       function () {
            var $_Data = this.$_View.find('*').addBack().filter('form')
                    .one('reset',  function () {
                        arguments[0].stopPropagation();
                    });

            for (var i = 0;  $_Data[i];  i++)
                $_Data[i].reset();

            return this;
        }
    });
})(self, self.document, self.jQuery);


/* ---------- ListView Interface  v0.8 ---------- */

//  Thanks "EasyWebApp" Project --- http://git.oschina.net/Tech_Query/EasyWebApp


(function (BOM, DOM, $) {

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
            $_View = $($_View).find('*:list, *[multiple]')
                .not('input[type="file"]');

            if (Init_Instance === true) {
                for (var i = 0;  i < $_View.length;  i++)
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
                $($.merge.call($, [ ], iReturn))  :  $_Item;

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
})(self, self.document, self.jQuery);


/* ---------- GalleryView Interface  v0.1 ---------- */

//  Sub-Class of ListView optimized for Multimedia


(function (BOM, DOM, $) {

    function GalleryView($_View, $_Item, onUpdate) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, $_Item, onUpdate);

        var _This_ = $.ListView.apply(this, arguments);

        if ((_This_ !== this)  ||  (! _This_.$_View.children()[0]))
            return _This_;

        _This_.viewPort = [0, 1];

        _This_.on('insert',  function ($_Item, _, Index) {
            var $_Prev = _This_[--Index];

            if ((! $_Prev)  ||  $_Prev.inViewport()) {
                _Self_.toggle($_Item, true);
                return;
            }

            _This_.viewPort[1] = Index;

            _Self_.toggle( $_Item ).filter('[data-src]').one('load',  function () {

                this.width = $(this).css('width');

                this.height = $(this).css('height');
            });
        }).$_View.add( document ).scroll(function () {

            var View_Port = [ ];

            for (var i = _This_.viewPort[0];  _This_[i];  i++)
                if ( _This_[i].inViewport() ) {
                    if (View_Port[0] === undefined)  View_Port[0] = i;

                    _Self_.toggle(_This_[i], true);
                } else {
                    if (View_Port[1] === undefined)  View_Port[1] = i;

                    _Self_.toggle( _This_[i] );
                }

            if (View_Port[0] != null)
                _This_.viewPort[0] = View_Port[0];

            if (View_Port[1] != null)
                _This_.viewPort[1] = View_Port[1];
        });

        return _This_;
    }

    function iShow() {
        if ( this.dataset.src )  this.src = this.dataset.src;

        if ( this.dataset.style )
            this.style.backgroundImage = this.dataset.style;
    }

    function iHide() {
        var iURL = this.getAttribute('src'),
            BGI = this.style.backgroundImage;

        if ( iURL ) {
            this.removeAttribute('src');

            this.setAttribute('data-src', iURL);
        }

        if (BGI.length > 7) {
            this.style.backgroundImage = '';

            this.setAttribute('data-style', BGI);
        }
    }

    return  $.GalleryView = $.inherit($.ListView, GalleryView, {
        instanceOf:    function () {
            var iView = $.ListView.instanceOf.apply(this, arguments);

            return  iView  ||  $.ListView.instanceOf.apply($.ListView, arguments);
        },
        toggle:        function ($_Item) {

            return  $_Item.add( $_Item.find('*') ).filter(':media').each(
                arguments[1]  ?  iShow  :  iHide
            );
        }
    });
})(self, self.document, self.jQuery);


/* ---------- TreeView Interface  v0.2 ---------- */


(function (BOM, DOM, $) {

    function TreeView(iListView, iKey, Init_Depth, onFork) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_(iListView, iKey, Init_Depth, onFork);

        var iArgs = $.makeArray( arguments ).slice(1);

        iKey = (typeof iArgs[0] == 'string')  ?  iArgs.shift()  :  'list';
        this.initDepth = (typeof iArgs[0] == 'number')  ?
            iArgs.shift()  :  Infinity;

        var _This_ = $.CommonView.call(this, iListView.$_View)
                .on('branch', iArgs[0]);

        if ((_This_ !== this)  ||  (! _This_.$_View.children()[0]))
            return _This_;

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

    return  $.TreeView = $.inherit($.CommonView, TreeView, null, {
        render:     function ($_Fork, iData) {
            if (iData  ||  (! ($_Fork instanceof Array)))
                $_Fork = $($_Fork);
            else {
                iData = $_Fork;
                $_Fork = this.$_View;
            }

            $.ListView.instanceOf($_Fork, false).render(
                iData || $_Fork.data('TV_Model')
            ).$_View.children().removeClass('active');

            return this;
        },
        clear:      function () {
            this[0][0].clear();

            return this;
        },
        branch:     function ($_Item, iData) {
            var iFork = ($_Item instanceof $.ListView)  ?  $_Item  :  (
                    $.ListView.instanceOf( $_Item ).fork( $_Item )
                );
            var iDepth = $.trace(iFork, 'parentView').length;

            if (! this[iDepth])  this[this.length++] = [ ];

            this[iDepth].push( iFork.clear() );

            if (this.initDepth > iDepth)
                this.render(iFork.$_View, iData);
            else {
                iFork.$_View.data('TV_Model', iData);
                iData = null;
            }

            this.trigger('branch',  [iFork, this.length, iData]);

            $.fn.off.apply(iFork.$_View.addClass('TreeNode'), this.listener);

            return iFork;
        },
        valueOf:    function () {
            return this[0][0].valueOf();
        }
    });
})(self, self.document, self.jQuery);


/* ---------- HTML 5  History API  Polyfill ---------- */


(function (BOM, DOM, $) {

    if (! ($.browser.msie < 10))  return;

    var _BOM_,  _Pushing_,  _State_ = [[null, DOM.title, DOM.URL]];

    $(DOM).ready(function () {
        var $_iFrame = $('<iframe />', {
                id:     '_HTML5_History_',
                src:    'blank.html',
                css:    {display:  'none'}
            }).appendTo(this.body),
            $_Parent = $(BOM);

        _BOM_ = $_iFrame[0].contentWindow;

        $_iFrame.on('load',  function () {
            if (_Pushing_) {
                _Pushing_ = false;
                return;
            }

            var iState = _State_[ _BOM_.location.search.slice(7) ];
            if (! iState)  return;

            BOM.history.state = iState[0];
            DOM.title = iState[1];

            $_Parent.trigger({
                type:     'popstate',
                state:    iState[0]
            });
        });
    });

    BOM.history.pushState = function (iState, iTitle, iURL) {
        for (var iKey in iState)
            if (! $.isData(iState[iKey]))
                throw ReferenceError("The History State can't be Complex Object !");

        if (typeof iTitle != 'string')
            throw TypeError("The History State needs a Title String !");

        if (_BOM_) {
            DOM.title = iTitle;
            if ($.browser.modern)  _BOM_.document.title = iTitle;
            _Pushing_ = true;
            _BOM_.location.search = 'index=' + (_State_.push(arguments) - 1);
        }
    };

    BOM.history.replaceState = function () {
        _State_ = [ ];
        this.pushState.apply(this, arguments);
    };

})(self, self.document, self.jQuery);



(function (BOM, DOM, $) {

/* ---------- Base64 to Blob  v0.1 ---------- */

//  Thanks "axes" --- http://www.cnblogs.com/axes/p/4603984.html

    $.toBlob = function (iType, iString) {
        if (arguments.length == 1) {
            iString = iType.match(/^data:([^;]+);base64,(.+)/);
            iType = iString[1];
            iString = iString[2];
        }
        iString = BOM.atob(iString);

        var iBuffer = new ArrayBuffer(iString.length);
        var uBuffer = new Uint8Array(iBuffer);

        for (var i = 0;  i < iString.length;  i++)
            uBuffer[i] = iString.charCodeAt(i);

        var BlobBuilder = BOM.WebKitBlobBuilder || BOM.MozBlobBuilder;

        if (! BlobBuilder)
            return  new BOM.Blob([iBuffer],  {type: iType});

        var iBuilder = new BlobBuilder();
        iBuilder.append(iBuffer);
        return iBuilder.getBlob(iType);
    };

/* ---------- Hash Algorithm (Crypto API Wrapper)  v0.1 ---------- */

//  Thanks "emu" --- http://blog.csdn.net/emu/article/details/39618297

    function BufferToString(iBuffer){
        var iDataView = new DataView(iBuffer),
            iResult = [ ];

        for (var i = 0, iTemp;  i < iBuffer.byteLength;  i += 4) {
            iTemp = iDataView.getUint32(i).toString(16);
            iResult.push(
                ((iTemp.length == 8) ? '' : '0') + iTemp
            );
        }
        return iResult.join('');
    }

    $.dataHash = function (iAlgorithm, iData, iCallback, iFailback) {
        var iCrypto = BOM.crypto || BOM.msCrypto;
        var iSubtle = iCrypto.subtle || iCrypto.webkitSubtle;

        iAlgorithm = iAlgorithm || 'SHA-512';
        iFailback = iFailback || iCallback;

        try {
            iData = iData.split('');
            for (var i = 0;  i < iData.length;  i++)
                iData[i] = iData[i].charCodeAt(0);

            var iPromise = iSubtle.digest(
                    {name:  iAlgorithm},
                    new Uint8Array(iData)
                );

            if(typeof iPromise.then == 'function')
                iPromise.then(
                    function () {
                        iCallback.call(this, BufferToString(arguments[0]));
                    },
                    iFailback
                );
            else
                iPromise.oncomplete = function () {
                    iCallback.call(
                        this,  BufferToString( arguments[0].target.result )
                    );
                };
        } catch (iError) {
            iFailback(iError);
        }
    };

})(self, self.document, self.jQuery);


//
//              >>>  iQuery+  <<<
//
//
//    [Version]    v1.6  (2016-12-13)  Stable
//
//    [Require]    iQuery  ||  jQuery with jQuery+
//
//
//        (C)2015-2016  shiy2008@gmail.com
//
});
