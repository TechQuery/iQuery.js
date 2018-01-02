define(['../../iQuery'],  function ($) {

    return $.extend({
        /**
         * 定字定数分割字符串
         *
         * @author TechQuery
         *
         * @memberof $
         *
         * @param {string}        string  - Raw Text
         * @param {string|RegExp} [split] - Separator to split as
         *                                  `String.prototype.split`
         * @param {number}        [max]   - Max number of returned parts
         * @param {string}        [join]  - String to join
         *                                  (Default value is same as `split`)
         * @return {string[]}
         *
         * @example  // 原型方法等效
         *
         *     $.split('abc', '')    // ['a', 'b', 'c']
         *
         * @example  // PHP str_split() 等效
         *
         *     $.split('abc', '', 2)    // ['a', 'bc']
         *
         * @example  // 连接字符串
         *
         *     $.split("a  b\tc",  /\s+/,  2,  ' ')    // ['a', 'b c']
         */
        split:         function (string, split, max, join) {

            string = string.split( split );

            if ( max ) {
                string[max - 1] = string.slice(max - 1).join(
                    (typeof join === 'string')  ?  join  :  split
                );
                string.length = max;
            }

            return string;
        },
        /**
         * 连字符化字符串
         *
         * @author TechQuery
         *
         * @memberof $
         *
         * @param {string} raw - Non Hyphen-Case String
         *
         * @return {string}
         *
         * @example  // 符号间隔
         *
         *     $.hyphenCase('UPPER_CASE')    // 'upper-case'
         *
         * @example  // 驼峰法
         *
         *     $.hyphenCase('camelCase')    // 'camel-case'
         *
         * @example  // 混杂写法
         *
         *     $.hyphenCase('UPPER_CASEMix -camelCase')
         *
         *     // 'upper-case-mix-camel-case'
         */
        hyphenCase:    function (raw) {

            return raw.replace(
                /[^A-Za-z0-9]+/g, '-'
            ).replace(
                /([A-Za-z0-9])([A-Z][a-z])/g, '$1-$2'
            ).toLowerCase();
        },
        byteLength:    function () {

            return arguments[0].replace(
                /[^\u0021-\u007e\uff61-\uffef]/g,  'xx'
            ).length;
        },
        isSelector:    function () {
            try {
                return  (!! $( arguments[0] ));

            } catch (iError) {  return false;  }
        }
    });
});
