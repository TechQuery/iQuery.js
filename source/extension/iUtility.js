define(['jquery'],  function ($) {

    var BOM = self,  DOM = self.document;

    var WindowType = $.makeSet('Window', 'DOMWindow', 'Global');

    $.extend({
        Type:    function (iVar) {
            var iType;

            try {
                iType = $.type( iVar );

                var iName = iVar.constructor.name;
                iName = (typeof iName == 'function')  ?
                    iName.call( iVar.constructor )  :  iName;

                if ((iType == 'object')  &&  iName)
                    iType = iName;
                else
                    iType = iType[0].toUpperCase() + iType.slice(1);
            } catch (iError) {
                return 'Window';
            }

            if (! iVar)
                return  (isNaN(iVar)  &&  (iVar !== iVar))  ?  'NaN'  :  iType;

            if (WindowType[iType] || (
                (iVar == iVar.document) && (iVar.document != iVar)    //  IE 9- Hack
            ))
                return 'Window';

            if (iVar.location  &&  (iVar.location === (
                iVar.defaultView || iVar.parentWindow || { }
            ).location))
                return 'Document';

            if (
                iType.match(/HTML\w+?Element$/) ||
                (typeof iVar.tagName == 'string')
            )
                return 'HTMLElement';

            if ( this.likeArray(iVar) ) {
                iType = 'Array';
                if ($.browser.msie < 10)  try {
                    iVar.item();
                    try {
                        iVar.namedItem();
                        return 'HTMLCollection';
                    } catch (iError) {
                        return 'NodeList';
                    }
                } catch (iError) { }
            }

            return iType;
        },
        split:            function (iString, iSplit, iLimit, iJoin) {
            iString = iString.split(iSplit);
            if (iLimit) {
                iString[iLimit - 1] = iString.slice(iLimit - 1).join(
                    (typeof iJoin == 'string') ? iJoin : iSplit
                );
                iString.length = iLimit;
            }
            return iString;
        },
        hyphenCase:       function () {
            return  arguments[0].replace(/([a-z0-9])[\s_]?([A-Z])/g,  function () {
                return  arguments[1] + '-' + arguments[2].toLowerCase();
            });
        },
        byteLength:       function () {
            return arguments[0].replace(
                /[^\u0021-\u007e\uff61-\uffef]/g,  'xx'
            ).length;
        },
        curry:            function curry(iOrigin) {
            return  function iProxy() {
                return  (arguments.length >= iOrigin.length)  ?
                    iOrigin.apply(this, arguments)  :
                    $.proxy.apply($,  $.merge([iProxy, this],  arguments));
            };
        },
        isSelector:       function () {
            try {
                DOM.querySelector(arguments[0])
            } catch (iError) {
                return false;
            }
            return true;
        },
        formatJSON:       function () {
            return  BOM.JSON.stringify(arguments[0], null, 4)
                .replace(/(\s+"[^"]+":) ([^\s]+)/g, '$1    $2');
        },
        paramJSON:        function (Args_Str) {
            Args_Str = (
                Args_Str  ?  $.split(Args_Str, '?', 2)[1]  :  BOM.location.search
            ).match(/[^\?&\s]+/g);

            if (! Args_Str)  return { };

            var _Args_ = { };

            for (var i = 0, iValue;  i < Args_Str.length;  i++) {
                Args_Str[i] = this.split(Args_Str[i], '=', 2);

                iValue = BOM.decodeURIComponent( Args_Str[i][1] );

                if (
                    (! $.isNumeric(iValue))  ||
                    (parseInt(iValue).toString().length < 21)
                )  try {
                    iValue = $.parseJSON(iValue);
                } catch (iError) { }

                _Args_[ Args_Str[i][0] ] = iValue;
            }

            return _Args_;
        },
        extendURL:        function () {
            var iArgs = $.makeArray( arguments );
            var iURL = $.split(iArgs.shift(), '?', 2);

            if (! iArgs[0])  return arguments[0];

            iArgs.unshift( $.paramJSON('?' + iURL[1]) );

            return  iURL[0]  +  '?'  +  $.param($.extend.apply($, iArgs));
        },
        paramSign:        function (iData) {
            iData = (typeof iData == 'string')  ?  this.paramJSON(iData)  :  iData;

            return  $.map(Object.keys(iData).sort(),  function (iKey) {

                switch (typeof iData[iKey]) {
                    case 'function':    return;
                    case 'object':      try {
                        return  iKey + '=' + JSON.stringify(iData[iKey]);
                    } catch (iError) { }
                }
                return  iKey + '=' + iData[iKey];

            }).join(arguments[1] || '&');
        },
        fileName:         function () {
            return (
                arguments[0] || BOM.location.pathname
            ).match(/([^\?\#]+)(\?|\#)?/)[1].split('/').slice(-1)[0];
        },
        filePath:         function () {
            return (
                arguments[0] || BOM.location.href
            ).match(/([^\?\#]+)(\?|\#)?/)[1].split('/').slice(0, -1).join('/');
        },
        urlDomain:        function () {
            return ((
                arguments[0] || BOM.location.href
            ).match(/^(\w+:)?\/\/[^\/]+/) || '')[0];
        },
        isCrossDomain:    function () {
            var iDomain = this.urlDomain( arguments[0] );

            return  iDomain && (
                iDomain != [
                    BOM.location.protocol, '//', DOM.domain, (
                        BOM.location.port  ?  (':' + BOM.location.port)  :  ''
                    )
                ].join('')
            );
        },
        cssPX:            RegExp([
            'width', 'height', 'padding', 'border-radius', 'margin',
            'top', 'right', 'bottom',  'left'
        ].join('|'))
    });

/* ---------- CRC-32  v0.1 ---------- */

//  Thanks "Bakasen" for http://blog.csdn.net/bakasen/article/details/6043797

    $.extend({
        CRC_32:           (function () {
            var iTable = new Array(256);

            for (var i = 0, iCell;  i < 256;  i++) {
                iCell = i;

                for (var j = 0;  j < 8;  j++)
                    if (iCell & 1)
                        iCell = ((iCell >> 1) & 0x7FFFFFFF)  ^  0xEDB88320;
                    else
                        iCell = (iCell >> 1)  &  0x7FFFFFFF;

                iTable[i] = iCell;
            }

            return iTable;
        })(),
        crc32:            function (iRAW) {
            iRAW = '' + iRAW;

            var iValue = 0xFFFFFFFF;

            for (var i = 0;  iRAW[i];  i++)
                iValue = ((iValue >> 8) & 0x00FFFFFF)  ^  this.CRC_32[
                    (iValue & 0xFF)  ^  iRAW.charCodeAt(i)
                ];

            return  iValue ^ 0xFFFFFFFF;
        }
    });
});