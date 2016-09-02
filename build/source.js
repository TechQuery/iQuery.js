({
    name:            'iQuery',
    baseUrl:         '../source',
    paths:           {
        jquery:    'http://cdn.bootcss.com/jquery/1.12.4/jquery'
    },
    out:             '../iQuery.js',
    onBuildWrite:    function (iName) {
        var fParameter = 'BOM, DOM',  aParameter = 'self,  self.document';

        if (! iName.match(/ES_API|Promise/)) {
            fParameter += ', $';
            aParameter += ',  self.iQuery || iQuery';
        }

        if (iName == 'iQuery')  return '';

        return arguments[2]
            .replace(/^define[\s\S]+?(function \()[^\)]*/m,  "\n($1" + fParameter)
            .replace(/\s+var BOM.+?;/, '')
            .replace(/\}\);\s*$/,  '})(' + aParameter + ");\n\n");
    },
    wrap:            {
        startFile:    'xWrap_0.txt',
        end:          '});'
    },
    optimize:        'none'
});