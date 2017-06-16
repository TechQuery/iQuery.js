define(['jquery', 'index'],  function ($, iQuery) {

    if ($ != iQuery) {

        iQuery.patch($, iQuery).ajaxPatch();


        console.groupCollapsed('[Diff with jQuery]');

        for (var key in $)
            console.assert(iQuery[key] != null,  key);

        console.groupEnd();


        console.groupCollapsed('[Diff with $.fn]');

        for (var key in $.fn)
            console.assert(iQuery.fn[key] != null,  key);

        console.groupEnd();
    }
});