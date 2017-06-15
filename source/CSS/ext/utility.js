define(['../../iQuery', '../../DOM/info', '../../DOM/traversing'],  function ($) {

/* ---------- Smart zIndex ---------- */

    function Get_zIndex() {
        for (
            var $_This = $( this ),  zIndex;
            $_This[0];
            $_This = $( $_This[0].offsetParent )
        )
            if ($_This.css('position') != 'static') {

                zIndex = parseInt( $_This.css('z-index') );

                if (zIndex > 0)  return zIndex;
            }

        return 0;
    }

    function Set_zIndex() {

        var $_This = $( this ),  _Index_ = 0;

        $_This.siblings().addBack().filter(':visible').each(function () {

            _Index_ = Math.max(_Index_,  Get_zIndex.call( this ));
        });

        $_This.css('z-index', ++_Index_);
    }

    $.fn.zIndex = function (new_Index) {

        if (! arguments.length)  return  Get_zIndex.call( this[0] );

        if (new_Index === '+')  return  this.each( Set_zIndex );

        return  this.css('z-index',  parseInt( new_Index ) || 'auto');
    };

});