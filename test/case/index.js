define(['jquery', 'iQuery'],  function ($, iQuery) {

    if ($ != iQuery) {

        iQuery.patch($, iQuery);

        for (var key in $)
            console.assert(
                iQuery[key] != null,  '[Diff with jQuery] ' + key
            );
    }
});