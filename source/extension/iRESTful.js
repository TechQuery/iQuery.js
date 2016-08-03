define(['jquery'],  function ($) {

    function HTTP_Request(iMethod, iURL, iData, iCallback) {
        if (typeof iData == 'function') {
            iCallback = iData;
            iData = null;
        }
        return  $.ajax({
            method:         iMethod,
            url:            iURL,
            data:           iData,
            success:        iCallback,
            crossDomain:    true
        });
    }

    var HTTP_Method = $.makeSet('PUT', 'DELETE');

    for (var iMethod in HTTP_Method)
        $[ iMethod.toLowerCase() ] = $.proxy(HTTP_Request, BOM, iMethod);

});