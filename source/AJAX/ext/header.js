define(['../../iQuery'],  function ($) {

    var parser = {
            link:    function (raw) {

                var link = { };

                raw.replace(
                    /\<(\S+?)\>; rel="(\w+)"(?:; title="(.*?)")?/g,
                    function (_, URI, rel, title) {

                        link[ rel ] = {
                            uri:      URI,
                            rel:      rel,
                            title:    title
                        };
                    }
                );

                return link;
            }
        };

    /**
     * HTTP 报文头解析
     *
     * @author   TechQuery
     *
     * @memberof $
     *
     * @param    {string} raw - Raw Text of HTTP Headers
     *
     * @returns  {object} Object of HTTP Headers
     */

    $.parseHeader = function (raw) {

        var header = { };

        raw.replace(/^([\w\-]+):\s*(.*)$/mg,  function (_, key, value) {

            if (parser[ key ])  value = parser[ key ]( value );

            if (typeof header[ key ]  ===  'string')
                header[ key ] = [header[ key ]];

            if (header[ key ]  instanceof  Array)
                header[ key ].push( value );
            else
                header[ key ] = value;
        });

        return header;
    };
});