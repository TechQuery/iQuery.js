(function (BOM) {

    var iQuery;

    BOM.define = (typeof BOM.define == 'function')  ?
        BOM.define  :
        function () {
            var iExport = arguments[arguments.length - 1](iQuery, iQuery);

            if (iExport && iExport.fn && iExport.fn.jquery)
                iQuery = iExport;
        };

