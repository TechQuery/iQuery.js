define(['../../iQuery'],  function ($) {

    return $.extend({
        /**
         * 定字定数分割字符串
         *
         * @author TechQuery
         *
         * @memberof $
         *
         * @param   {string}        string  - Raw Text
         * @param   {string|RegExp} [split] - Separator to split as
         *                                    `Array.prototype.split`
         * @param   {number}        [max]   - Max number of returned parts
         * @param   {string}        [join]  - String to join
         *                                    (Default value is same as `split`)
         * @returns {string[]}
         */
        split:         function (string, split, max, join) {

            string = string.split( split );

            if (max) {
                string[max - 1] = string.slice(max - 1).join(
                    (typeof join == 'string') ? join : split
                );
                string.length = max;
            }

            return string;
        },
        /**
         * 连字符化字符串
         *
         * @author   TechQuery
         *
         * @memberof $
         *
         * @param    {string} raw - Non Hyphen-Case String
         *
         * @returns  {string}
         */
        hyphenCase:    function (raw) {

            return  raw.toLowerCase().replace(/(\S)[^a-z0-9]+(\S)/g,  function () {

                return  arguments[1] + '-' + arguments[2];
            });
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