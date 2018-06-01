define(['../iQuery', '../polyfill/DOM/IE-8', '../polyfill/BOM/URL'],  function ($) {

    return $.extend({
        now:              Date.now,
        trim:             function () {
            return arguments[0].trim();
        },
        /**
         * 驼峰化字符串
         *
         * @author   TechQuery
         *
         * @memberof $
         *
         * @param    {string} raw - Non Camel-Case String
         *
         * @returns  {string}
         */
        camelCase:        function (raw) {

            return  raw.replace(/[^A-Za-z0-9]+([A-Za-z0-9])/g,  function () {

                return arguments[1].toUpperCase();
            });
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

            var iXML = (new self.DOMParser()).parseFromString(iString, 'text/xml');

            var iError = iXML.getElementsByTagName('parsererror');

            if (iError.length)
                throw  new SyntaxError(1, iError[0].childNodes[1].nodeValue);

            iXML.cookie;    //  for old WebKit core to throw Error

            return iXML;
        },
        param:            function (iObject) {

            var iParameter = new self.URLSearchParams();

            if ($.likeArray( iObject ))
                for (var i = 0;  iObject[i];  i++)
                    iParameter.append(iObject[i].name, iObject[i].value);
            else
                $.each(iObject,  function (iName) {

                    var iValue = (this === self)  ?  ''  :  this;

                    iValue = $.isPlainObject( iValue )  ?
                        JSON.stringify( iValue )  :  iValue;

                    if ($.likeArray( iValue ))
                        for (var i = 0;  i < iValue.length;  i++)
                            iParameter.append(iName, iValue[i]);
                    else
                        iParameter.append(iName, iValue);
                });

            return  iParameter + '';
        },
        contains:         function (iParent, iChild) {

            if (! iChild)  return false;

            return  (typeof iParent.contains != 'function')  ?
                !!(iParent.compareDocumentPosition( iChild )  &  16)  :
                ((iParent !== iChild)  &&  iParent.contains( iChild ));
        }
    });
});
