({
    baseUrl:                    '../source',
    name:                       'iQuery',
    out:                        '../iQuery.min.js',
    generateSourceMaps:         true,
    preserveLicenseComments:    false,
    onBuildWrite:               function (iName) {
        var fParameter = '$',  aParameter = 'self.iQuery';

        if (iName  in  {'ES-5': 1, iCore: 1}) {
            fParameter = 'BOM, DOM';
            aParameter = 'self, self.document';
            arguments[2] = arguments[2].replace(/\s+var BOM.+?;/, '');
        }

        return arguments[2]
            .replace(/^define[\s\S]+?(function \()[^\)]*/m,  "\n($1" + fParameter)
            .replace(/\}\).$/,  '})(' + aParameter + ");\n\n");
    },
    wrap:                       {
        startFile:    'xWrap_0.txt',
        end:          '});'
    }
});