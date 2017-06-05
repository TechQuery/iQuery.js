define(['iObject'],  function ($) {

    var BOM = self;

    $.extend({
        trim:             function () {
            return  arguments[0].trim();
        },
        camelCase:        function (iName) {

            iName = iName.split(arguments[1] || '-');

            for (var i = 1;  i < iName.length;  i++)
                iName[i] = iName[i][0].toUpperCase() + iName[i].slice(1);

            return iName.join('');
        },
        parseJSON:        function (iJSON) {

            return  JSON.parse(iJSON,  function (iKey, iValue) {

                if (iKey && (typeof iValue == 'string'))  try {

                    return  JSON.parse( iValue );

                } catch (iError) { }

                return iValue;
            });
        },
        parseXML:         function (iString) {

            iString = iString.trim();

            if ((iString[0] != '<')  ||  (iString[iString.length - 1] != '>'))
                throw 'Illegal XML Format...';

            var iXML = (new BOM.DOMParser()).parseFromString(iString, 'text/xml');

            var iError = iXML.getElementsByTagName('parsererror');

            if (iError.length)
                throw  new SyntaxError(1, iError[0].childNodes[1].nodeValue);

            iXML.cookie;    //  for old WebKit core to throw Error

            return iXML;
        },
        param:            function (iObject) {

            var iParameter = new BOM.URLSearchParams();

            if ($.likeArray( iObject ))
                for (var i = 0;  iObject[i];  i++)
                    iParameter.append(iObject[i].name, iObject[i].value);
            else
                $.each(iObject,  function (iName) {

                    var iValue = (this == BOM)  ?  ''  :  this;

                    iValue = $.isPlainObject( iValue )  ?
                        JSON.stringify( iValue )  :  iValue;

                    if ($.likeArray( iValue ))
                        $.map(
                            iValue,  $.proxy(iParameter.append, iParameter, iName)
                        );
                    else
                        iParameter.append(iName, iValue);
                });

            return  iParameter + '';
        },
        contains:         function (iParent, iChild) {
            if (! iChild)  return false;

            if ($.browser.modern)
                return  !!(iParent.compareDocumentPosition(iChild) & 16);
            else
                return  (iParent !== iChild) && iParent.contains(iChild);
        }
    });

/* ---------- Function Wrapper ---------- */

    var ProxyCache = {
            origin:     [ ],
            wrapper:    [ ]
        };

    $.proxy = function (iFunction, iContext) {
        var iArgs = $.makeArray(arguments);

        for (var i = 0;  i < ProxyCache.origin.length;  i++)
            if ($.isEqual(ProxyCache.origin[i], iArgs))
                return ProxyCache.wrapper[i];

        var Index = ProxyCache.origin.push( iArgs ) - 1;

        iArgs = iArgs.slice(2);

        return  ProxyCache.wrapper[Index] = function () {
            return  iFunction.apply(
                iContext || this,  $.merge([ ], iArgs, arguments)
            );
        };
    };

});