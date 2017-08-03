define(['../../utility/ext/timer'],  function ($) {

    return  $.extend(true, {
        fn:       {uniqueId:  function () {

            return  $.each(this,  function () {

                if (! this.id)  this.id = $.uuid('iQuery');
            })
        }},
        cssPX:    $.makeSet(
            'width', 'height', 'padding', 'border-radius', 'margin',
            'top', 'right', 'bottom',  'left'
        )
    });
});