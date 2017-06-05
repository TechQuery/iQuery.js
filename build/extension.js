({
    name:            'iQuery',
    baseUrl:         '../source/',
    paths:           {
        jquery:    'http://cdn.bootcss.com/jquery/1.12.4/jquery'
    },
    out:             '../jQueryKit.js',
    onBuildWrite:    function (iName) {
        var fParameter = 'BOM, DOM',  aParameter = 'self, self.document';

        if (! iName.match(/ES_API|Promise/)) {
            fParameter += ', $';
            aParameter += ', self.jQuery';
        }

        if (iName.indexOf('extension') == -1)  return '';

        return arguments[2]
            .replace(/^define[\s\S]+?(function \()[^\)]*/m,  "\n($1" + fParameter)
            .replace(/\s+var BOM.+?;/, '')
            .replace(/\}\);\s*$/,  '})(' + aParameter + ");\n\n");
    },
    wrap:            {
        startFile:    'jQueryKit_Wrap.txt',
        end:          '});'
    },
    optimize:        'none'
});
