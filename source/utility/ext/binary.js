define(['./string', '../../polyfill/Promise_A+'],  function ($) {

    var BOM = self;


    function Bit_Calculate(type, left, right) {

        left = parseInt(left, 2);    right = parseInt(right, 2);

        switch (type) {
            case '&':    return  left & right;
            case '|':    return  left | right;
            case '^':    return  left ^ right;
            case '~':    return  ~left;
        }
    }

    /**
     * 大数位操作
     *
     * @author  TechQuery
     * @version 0.1
     *
     * @memberof $
     *
     * @param {string}          type    `&`, `|`, `^` or `~`
     * @param {(number|string)} left    Number may be big
     * @param {(number|string)} [right] Number may be big
     *
     * @return {(number|string)}
     *
     * @example  // 按位或
     *
     *     $.bitOperate('|', '10'.repeat(16), '01'.repeat(16))
     *
     *     // '1'.repeat(32)
     */

    $.bitOperate = function (type, left, right) {

        left = (typeof left === 'string')  ?  left  :  left.toString(2);

        right = (typeof right === 'string')  ?  right  :  right.toString(2);

        var iLength = Math.max(left.length, right.length);

        if (iLength < 32)
            return  Bit_Calculate(type, left, right).toString(2);

        left = left.padStart(iLength, 0);

        right = right.padStart(iLength, 0);

        var result = '';

        for (var i = 0;  i < iLength;  i += 31)
            result += Bit_Calculate(
                type,  left.slice(i, i + 31),  right.slice(i, i + 31)
            ).toString(2).padStart(
                Math.min(31,  iLength - i),  0
            );

        return result;
    };


    var LS_Key = [ ];

    /**
     * 本地存储 存取器
     *
     * @author   TechQuery
     * @version  0.1
     *
     * @memberof $
     *
     * @param    {string} name
     * @param    {*}      data
     *
     * @returns  {*}      Same as `data`
     */

    $.storage = function (name, data) {

        if (! (data != null))  return  JSON.parse(BOM.localStorage[ name ]);

        var iLast = 0,  iLength = Math.min(LS_Key.length, BOM.localStorage.length);

        do  try {
            BOM.localStorage[ name ] = JSON.stringify( data );

            if (LS_Key.indexOf( name )  ===  -1)  LS_Key.push( name );
            break;
        } catch (iError) {
            if (LS_Key[ iLast ]) {
                delete  BOM.localStorage[ LS_Key[iLast] ];

                LS_Key.splice(iLast, 1);
            } else
                iLast++ ;
        } while (iLast < iLength);

        return data;
    };

/* ---------- Base64 to Blob  v0.1 ---------- */

//  Thanks "axes" --- http://www.cnblogs.com/axes/p/4603984.html

    $.toBlob = function (iType, iString) {

        if (arguments.length == 1) {

            iString = iType.match(/^data:([^;]+);base64,(.+)/);

            iType = iString[1];    iString = iString[2];
        }

        iString = BOM.atob( iString );

        var iBuffer = new ArrayBuffer( iString.length );

        var uBuffer = new Uint8Array( iBuffer );

        for (var i = 0;  iString[i];  i++)
            uBuffer[i] = iString.charCodeAt(i);

        var BlobBuilder = BOM.WebKitBlobBuilder || BOM.MozBlobBuilder;

        if (! BlobBuilder)
            return  new BOM.Blob([iBuffer],  {type: iType});

        var iBuilder = new BlobBuilder();    iBuilder.append( iBuffer );

        return  iBuilder.getBlob( iType );
    };

/* ---------- CRC-32  v0.1 ---------- */

//  Thanks "Bakasen" for http://blog.csdn.net/bakasen/article/details/6043797

    var CRC_32_Table = (function () {

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
        })();

    function CRC_32(iRAW) {

        iRAW = '' + iRAW;

        var iValue = 0xFFFFFFFF;

        for (var i = 0;  iRAW[i];  i++)
            iValue = ((iValue >> 8) & 0x00FFFFFF)  ^  CRC_32_Table[
                (iValue & 0xFF)  ^  iRAW.charCodeAt(i)
            ];

        return  iValue ^ 0xFFFFFFFF;
    }

/* ---------- Hash Algorithm (Crypto API Wrapper)  v0.1 ---------- */

//  Thanks "emu" --- http://blog.csdn.net/emu/article/details/39618297

    if ( BOM.msCrypto )
        $.each((BOM.crypto = BOM.msCrypto).subtle,  function (key, _This_) {

            if (! (_This_ instanceof Function))  return;

            BOM.crypto.subtle[ key ] = function () {

                var iObserver = _This_.apply(this, arguments);

                return  new Promise(function (iResolve) {

                    iObserver.oncomplete = function () {

                        iResolve( arguments[0].target.result );
                    };

                    iObserver.onabort = iObserver.onerror = arguments[1];
                });
            };
        });

    if (! BOM.crypto)  return;

    BOM.crypto.subtle = BOM.crypto.subtle || BOM.crypto.webkitSubtle;


    function BufferToString(iBuffer){

        var iDataView = new DataView(iBuffer),  iResult = '';

        for (var i = 0, iTemp;  i < iBuffer.byteLength;  i += 4) {

            iTemp = iDataView.getUint32(i).toString(16);

            iResult += ((iTemp.length == 8) ? '' : 0)  +  iTemp;
        }

        return iResult;
    }

    $.dataHash = function (iAlgorithm, iData) {

        if (arguments.length < 2) {

            iData = iAlgorithm;  iAlgorithm = 'CRC-32';
        }

        return  (iAlgorithm === 'CRC-32')  ?
            Promise.resolve( CRC_32( iData ) )  :
            BOM.crypto.subtle.digest(
                {name:  iAlgorithm},
                new Uint8Array(Array.from(iData,  function () {

                    return arguments[0].charCodeAt(0);
                }))
            ).then( BufferToString );
    };

});
