({
    name:            'iQuery',
    baseUrl:         '../source',
    paths:           {
        jquery:    'http://cdn.bootcss.com/jquery/1.12.3/jquery'
    },
    out:             '../iQuery.js',
    onBuildWrite:    function () {
        var fParameter = 'BOM, DOM',  aParameter = 'self,  self.document';

        if (arguments[0] != 'extension/ES-5') {
            fParameter += ', $';
            aParameter += ',  self.iQuery || iQuery';
        }
        return arguments[2]
            .replace(/^define[\s\S]+?(function \()[^\)]*/m,  "\n($1" + fParameter)
            .replace(/\s+var BOM.+?;/, '')
            .replace(/\}\).$/,  '})(' + aParameter + ");\n\n");
    },
    wrap:            {
        startFile:    'xWrap_0.txt',
        end:          '});'
    },
    optimize:        'none'
});