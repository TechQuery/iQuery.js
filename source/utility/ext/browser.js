define(['../../iCore'],  function ($) {

    var UA = self.navigator.userAgent;

    var is_Trident = UA.match(
            /MSIE (\d+)|Trident[^\)]+rv:(\d+)|Edge\/(\d+)\./i
        ),
        is_Gecko = UA.match(
            /; rv:(\d+)[^\/]+Gecko\/\d+/
        ),
        is_Webkit = UA.match(
            /AppleWebkit\/(\d+\.\d+)/i
        );

    var IE_Ver = is_Trident  ?  Number(is_Trident[1] || is_Trident[2])  :  NaN,
        FF_Ver = is_Gecko  ?  Number( is_Gecko[1] )  :  NaN,
        WK_Ver = is_Webkit  ?  parseFloat( is_Webkit[1] )  :  NaN;

    var is_Pad = UA.match(/Tablet|Pad|Book|Android 3/i),
        is_Phone = UA.match(/Phone|Touch|Android 2|Symbian/i);

    var is_Mobile = (is_Pad || is_Phone || UA.match(/Mobile/i))  &&
            (UA.indexOf(' PC ') === -1);

    var is_iOS = UA.match(
            /(iTouch|iPhone|iPad|iWatch);[^\)]+CPU[^\)]+OS (\d+_\d+)/i
        ),
        is_Android = UA.match( /(Android |Silk\/)(\d+\.\d+)/i );

    $.browser = {
        msie:             IE_Ver,
        mozilla:          FF_Ver,
        webkit:           WK_Ver,
        modern:           !  (IE_Ver < 9),
        mobile:           !! is_Mobile,
        pad:              !! is_Pad,
        phone:            (!! is_Phone)  ||  (is_Mobile  &&  (! is_Pad)),
        ios:              is_iOS  ?  parseFloat( is_iOS[2].replace('_', '.') )  :  NaN,
        android:          is_Android  ?  parseFloat( is_Android[2] )  :  NaN,
        versionNumber:    IE_Ver || FF_Ver || WK_Ver
    };

});