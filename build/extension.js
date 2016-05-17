({
    name:            'extension/jQuery+',
    baseUrl:         '../source/',
    paths:           {
        jquery:    'http://cdn.bootcss.com/jquery/1.12.3/jquery'
    },
    out:             '../source/jQuery+.js',
    onBuildWrite:    function () {
        var iName = arguments[0].split('/').slice(-1)[0],
            fParameter = 'BOM',  aParameter = 'self';

        if (iName != 'ES-5') {
            fParameter += ', DOM';
            aParameter += ', self.document';

            if (iName != 'iCore') {
                fParameter += ', $';
                aParameter += ', iQuery';
            }
        }
        return arguments[2]
            .replace(/^define[\s\S]+?(function \()[^\)]*/m,  "\n($1" + fParameter)
            .replace(/\s+var BOM.+?;/, '')
            .replace(/\}\).$/,  '})(' + aParameter + ");\n\n");
    },
    wrap:            {
        startFile:    'jQuery+_Wrap.txt',
        end:          '});'
    },
    optimize:        'none'
});