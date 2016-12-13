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
});