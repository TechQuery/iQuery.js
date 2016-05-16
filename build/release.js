({
    baseUrl:                    '../source',
    name:                       'iQuery',
    out:                        '../iQuery.min.js',
    generateSourceMaps:         true,
    preserveLicenseComments:    false,
    onBuildWrite:               function (iName) {
        var fParameter = 'BOM',  aParameter = 'self';

        if (iName != 'ES-5') {
            fParameter += ', DOM';
            aParameter += ', self.document';

            if (iName != 'iCore') {
                fParameter += ', $';
                aParameter += ', self.iQuery';
            }
        }
        return arguments[2]
            .replace(/^define[\s\S]+?(function \()[^\)]*/m,  "\n($1" + fParameter)
            .replace(/\s+var BOM.+?;/, '')
            .replace(/\}\).$/,  '})(' + aParameter + ");\n\n");
    },
    wrap:                       {
        startFile:    'xWrap_0.txt',
        end:          '});'
    }
});