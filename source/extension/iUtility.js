define(['jquery'],  function ($) {

    var BOM = self,  DOM = self.document;

    var WindowType = $.makeSet('Window', 'DOMWindow', 'Global');

    $.extend({
        Type:             function (iVar) {
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
        leftPad:          function (iRaw, iLength, iPad) {
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

});