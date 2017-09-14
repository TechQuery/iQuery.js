define(['../../utility/ext/string'],  function ($) {

    var BOM = self;

    $.paramJSON = function (search) {

        var _Args_ = { };

        $.each(
            Array.from(
                (new BOM.URLSearchParams(
                    (search || BOM.location.search).split('?')[1]
                )).entries()
            ),
            function () {
                if (
                    (! $.isNumeric(this[1]))  ||
                    Number.isSafeInteger( +this[1] )
                )  try {
                    this[1] = JSON.parse( this[1] );
                } catch (iError) { }

                if (this[0] in _Args_)
                    _Args_[this[0]] = [ ].concat(_Args_[this[0]], this[1]);
                else
                    _Args_[this[0]] = this[1];
            }
        );

        return _Args_;
    };

/* ---------- URL Parameter Signature  v0.1 ---------- */

    function JSON_Sign(iData) {

        return  '{'  +  $.map(Object.keys( iData ).sort(),  function (iKey) {

            return  '"'  +  iKey  +  '":'  +  JSON.stringify( iData[iKey] );

        }).join()  +  '}';
    }

    $.paramSign = function (iData) {

        iData = iData.valueOf();

        if (typeof iData === 'string')  iData = this.paramJSON( iData );

        var _Data_ = new BOM.URLSearchParams();

        $.each(iData,  function (name, value) {

            switch ( true ) {
                case  (this === BOM):
                    value = '';
                    break;
                case  (typeof value === 'object'):
                    value = JSON_Sign( this );
                    break;
                case  $.likeArray( this ):
                    value = '['  +  $.map(this, JSON_Sign).join()  +  ']';
                    break;
                case (this instanceof Function):
                    return;
            }

            _Data_.append(name, value);
        });

        _Data_.sort();

        return  _Data_ + '';
    };

    return $.extend({
        extendURL:    function (iURL) {

            if (! arguments[1])  return iURL;

            var iURL = $.split(iURL, '?', 2);

            var iPath = iURL[0];    arguments[0] = iURL[1];

            return  iPath  +  '?'  +  $.param($.extend.apply($,  Array.from(
                arguments,  function (_This_) {

                    _This_ = _This_.valueOf();

                    return  (typeof _This_ != 'string')  ?
                        _This_  :  $.paramJSON('?' + _This_);
                }
            )));
        },
        fileName:     function () {
            return (
                arguments[0] || BOM.location.pathname
            ).match(/([^\?\#]+)(\?|\#)?/)[1].split('/').slice(-1)[0];
        },
        filePath:     function () {
            return (
                arguments[0] || BOM.location.href
            ).match(/([^\?\#]+)(\?|\#)?/)[1].split('/').slice(0, -1).join('/');
        },
        urlDomain:    function (iURL) {

            return  (! iURL)  ?  BOM.location.origin  :
                (iURL.match( /^(\w+:)?\/\/[^\/]+/ )  ||  '')[0];
        },
        isXDomain:    function () {
            return (
                BOM.location.origin !==
                (new BOM.URL(arguments[0],  this.filePath() + '/')).origin
            );
        }
    });
});