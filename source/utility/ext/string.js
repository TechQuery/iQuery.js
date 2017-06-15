define(['../../iQuery'],  function ($) {

    return $.extend({
        split:         function (iString, iSplit, iLimit, iJoin) {

            iString = iString.split(iSplit);

            if (iLimit) {
                iString[iLimit - 1] = iString.slice(iLimit - 1).join(
                    (typeof iJoin == 'string') ? iJoin : iSplit
                );
                iString.length = iLimit;
            }

            return iString;
        },
        hyphenCase:    function () {
            return  arguments[0].replace(/([a-z0-9])[\s_]?([A-Z])/g,  function () {

                return  arguments[1] + '-' + arguments[2].toLowerCase();
            });
        },
        byteLength:    function () {

            return arguments[0].replace(
                /[^\u0021-\u007e\uff61-\uffef]/g,  'xx'
            ).length;
        },
        leftPad:       function (iRaw, iLength, iPad) {
            iPad += '';

            if (! iPad) {
                if ($.isNumeric( iRaw ))
                    iPad = '0';
                else if (typeof iRaw == 'string')
                    iPad = ' ';
            }
            iRaw += '',  iLength *= 1;

            if (iRaw.length >= iLength)  return iRaw;

            return iPad.repeat(
                Math.ceil((iLength -= iRaw.length)  /  iPad.length)
            ).slice(-iLength) + iRaw;
        },
        isSelector:    function () {
            try {
                document.querySelector( arguments[0] );

            } catch (iError) {  return false;  }

            return true;
        }
    });
});