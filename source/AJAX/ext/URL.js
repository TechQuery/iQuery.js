define(['../../utility/ext/string', '../../utility/index'],  function ($) {

    var BOM = self;

    /**
     * URL 查询参数对象化
     *
     * @author   TechQuery
     *
     * @memberof $
     *
     * @param    {string} [search] - Same format as `location.search` at least or
     *                               just use its value while the parameter is
     *                               empty
     * @returns  {object} Plain Object for the Query String
     *
     * @example  // URL 查询字符串
     *
     *     $.paramJSON('?a=1&b=two&b=true')
     *
     *     //  {
     *             a:    1,
     *             b:    ['two', true]
     *         }
     */

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
        /**
         * 更新 URL 查询参数
         *
         * @author   TechQuery
         *
         * @memberof $
         *
         * @param    {string}        URL   - the URL needs to be updated
         * @param    {string|object} param - One or more `key1=value1&key2=value2`
         *                                   or Key-Value Object
         * @returns  {string}        the Updated URL
         */
        extendURL:    function (URL, param) {

            if (! param)  return URL;

            var URL = $.split(URL, '?', 2);

            var path = URL[0];    arguments[0] = URL[1];

            return  path  +  '?'  +  $.param($.extend.apply($,  Array.from(
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
        /**
         * 获取文件路径
         *
         * @author   TechQuery
         *
         * @memberof $
         *
         * @param    {string} [URL] - Relative or Absolute URL
         *                            (Use `location.href` while the parameter is
         *                            empty)
         * @returns  {string}
         *
         * @example  // 传 相对路径 时返回其目录
         *
         *     $.filePath('/test/unit.html')  // '/test/'
         *
         * @example  // 传 查询字符串 时返回空字符串
         *
         *     $.filePath('?query=string')  // ''
         *
         * @example  // 传 URL（字符串）时返回其目录
         *
         *     $.filePath('http://localhost:8084/test/unit.html')
         *
         *     // 'http://localhost:8084/test/'
         *
         * @example  // 传 URL（对象）时返回其目录
         *
         *     $.filePath(new URL('http://localhost:8084/test/unit.html'))
         *
         *     // 'http://localhost:8084/test/'
         */
        filePath:     function (URL) {

            return  (arguments.length ? URL : BOM.location).toString()
                .split(/\?|\#/)[0]
                .replace(/[^\/\\]*$/, '');
        },
        /**
         * 获取 URL 的域（源）
         *
         * @author   TechQuery
         *
         * @memberof $
         *
         * @param    {string} [URL] - Absolute URL
         *                            (Use `location.origin` while the parameter
         *                            is empty)
         * @returns  {string} Origin of the URL
         *
         * @example  // 给定 URL
         *
         *     $.urlDomain('http://localhost:8080/path?query=string')
         *
         *     // 'http://localhost:8080'
         */
        urlDomain:    function (URL) {

            return  (! URL)  ?  BOM.location.origin  :
                (URL.match( /^(\w+:)?\/\/[^\/]+/ )  ||  '')[0];
        },
        /**
         * URL 跨域判断
         *
         * @author   TechQuery
         *
         * @memberof $
         *
         * @param    {string}  URL
         *
         * @returns  {boolean}
         *
         * @example  // 跨域 绝对路径
         *
         *     $.isXDomain('http://localhost/iQuery')  // true
         *
         * @example  // 同域 相对路径
         *
         *     $.isXDomain('/iQuery')  // false
         */
        isXDomain:    function (URL) {
            return (
                BOM.location.origin !==
                (new BOM.URL(URL, this.filePath())).origin
            );
        }
    });
});
