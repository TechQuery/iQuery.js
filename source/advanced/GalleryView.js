/* ---------- GalleryView Interface  v0.1 ---------- */

//  Sub-Class of ListView optimized for Multimedia

define(['jquery', 'ListView'],  function ($) {

    function GalleryView($_View, $_Item, onUpdate) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, $_Item, onUpdate);

        var _This_ = $.ListView.apply(this, arguments);

        if ((_This_ !== this)  ||  (! _This_.$_View.children()[0]))
            return _This_;

        _This_.on('insert',  function ($_Item, _, Index) {
            var $_Prev = _This_[--Index];

            if ((! $_Prev)  ||  $_Prev.inViewport()) {
                _Self_.toggle($_Item, true);
                return;
            }

            _Self_.toggle( $_Item ).filter('[data-src]')
                .each( iFreeze ).one('load', iFreeze);

        }).$_View.add( document ).scroll($.throttle(function () {

            for (var i = 0;  _This_[i];  i++)
                _Self_.toggle(_This_[i], _This_[i].inViewport());
        }));

        return _This_;
    }

    function iFreeze() {
        if (
            (typeof arguments[0] != 'object')  &&
            (this.tagName.toLowerCase() == 'img')  &&
            (! this.complete)
        )
            return;

        var $_This = $(this);

        $_This.width( $_This.css('width') );

        $_This.height( $_This.css('height') );
    }

    function iShow() {
        if ( this.dataset.src ) {
            this.src = this.dataset.src;

            this.removeAttribute('data-src');
        }

        if ( this.dataset.style ) {
            this.style.backgroundImage = this.dataset.style;

            this.removeAttribute('data-style');
        }
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
});