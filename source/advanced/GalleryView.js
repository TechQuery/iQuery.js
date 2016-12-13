/* ---------- GalleryView Interface  v0.1 ---------- */

//  Sub-Class of ListView optimized for Multimedia

define(['jquery', 'ListView'],  function ($) {

    function GalleryView($_View, $_Item, onUpdate) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, $_Item, onUpdate);

        var _This_ = $.ListView.apply(this, arguments);

        if ((_This_ !== this)  ||  (! _This_.$_View[0].children[0]))
            return _This_;

        _This_.viewPort = [0, 1];

        _This_.on('insert',  function ($_Item, _, Index) {
            var $_Prev = _This_[--Index];

            if ($_Prev  &&  (! $_Prev.inViewport())) {
                _This_.viewPort[1] = Index;

                _Self_.toggle( $_Item );
            } else
                _Self_.toggle($_Item, true);

        }).$_View.scrollParents().eq(0).scroll(function () {

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

    return  $.GalleryView = $.inherit($.ListView, GalleryView, {
        toggle:    function ($_Item, iShow) {

            $_Item = $_Item.add( $_Item.find('*') );

            if ( iShow )
                $_Item.filter('[data-src]:media').each(function () {

                    if ( this.dataset.src )  this.src = this.dataset.src;
                });
            else
                $_Item.filter('[src]:media').each(function () {

                    var iURL = this.getAttribute('src');

                    this.removeAttribute('src');

                    this.setAttribute('data-src', iURL);
                });
        }
    });
});