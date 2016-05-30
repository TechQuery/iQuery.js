define(['iObject'],  function ($) {

    var BOM = self;

    $.extend({
        trim:             function () {
            return  arguments[0].trim();
        },
        parseJSON:        BOM.JSON.parseAll,
        parseXML:         function (iString) {
            iString = iString.trim();
            if ((iString[0] != '<') || (iString[iString.length - 1] != '>'))
                throw 'Illegal XML Format...';

            var iXML = (new BOM.DOMParser()).parseFromString(iString, 'text/xml');

            var iError = iXML.getElementsByTagName('parsererror');
            if (iError.length)
                throw  new SyntaxError(1, iError[0].childNodes[1].nodeValue);
            iXML.cookie;    //  for old WebKit core to throw Error

            return iXML;
        },
        param:            function (iObject) {
            var iParameter = [ ],  iValue;

            if ($.isPlainObject( iObject ))
                for (var iName in iObject) {
                    iValue = iObject[iName];

                    if ( $.isPlainObject(iValue) )
                        iValue = BOM.JSON.stringify(iValue);
                    else if (! $.isData(iValue))
                        continue;

                    iParameter.push(iName + '=' + BOM.encodeURIComponent(iValue));
                }
            else if ($.likeArray( iObject ))
                for (var i = 0, j = 0;  i < iObject.length;  i++)
                    iParameter[j++] = iObject[i].name + '=' +
                        BOM.encodeURIComponent( iObject[i].value );

            return iParameter.join('&');
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
                iContext || this,  $.merge(iArgs, arguments)
            );
        };
    };

});