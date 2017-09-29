define(['../../iQuery'],  function ($) {

    var parser = {
            link:    function (raw) {

                var link = { };

                raw.replace(
                    /\<(\S+?)\>; rel="(\w+)"(; title="(.*?)")?/g,
                    function (_, URI, rel, _, title) {

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