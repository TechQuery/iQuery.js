define(['jquery'],  function ($) {

    var BOM = self;

/* ---------- Base64 to Blob  v0.1 ---------- */

//  Thanks "axes" --- http://www.cnblogs.com/axes/p/4603984.html

    $.toBlob = function (iType, iString) {
        if (arguments.length == 1) {
            iString = iType.match(/^data:([^;]+);base64,(.+)/);
            iType = iString[1];
            iString = iString[2];
        }
        iString = BOM.atob( iString );

        var iBuffer = new ArrayBuffer( iString.length );
        var uBuffer = new Uint8Array( iBuffer );

        for (var i = 0;  iString[i];  i++)
            uBuffer[i] = iString.charCodeAt(i);

        var BlobBuilder = BOM.WebKitBlobBuilder || BOM.MozBlobBuilder;

        if (! BlobBuilder)
            return  new BOM.Blob([iBuffer],  {type: iType});

        var iBuilder = new BlobBuilder();
        iBuilder.append( iBuffer );

        return  iBuilder.getBlob( iType );
    };

/* ---------- Hash Algorithm (Crypto API Wrapper)  v0.1 ---------- */

//  Thanks "emu" --- http://blog.csdn.net/emu/article/details/39618297

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
            iData = iAlgorithm;
            iAlgorithm = 'SHA-512';
        }
        var iCrypto = BOM.crypto || BOM.msCrypto;

        try {
            var iPromise = (iCrypto.subtle || iCrypto.webkitSubtle).digest(
                    {name:  iAlgorithm},
                    new Uint8Array(
                        Array.prototype.map.call(String( iData ),  function () {

                            return arguments[0].charCodeAt(0);
                        })
                    )
                );
            return  ((typeof iPromise.then == 'function')  ?
                iPromise  :  new Promise(function (iResolve) {

                    iPromise.oncomplete = function () {
                        iResolve( arguments[0].target.result );
                    };
                })
            ).then( BufferToString );

        } catch (iError) {
            return  Promise.reject( iError );
        }
    };
});