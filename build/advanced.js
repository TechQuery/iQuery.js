({
    baseUrl:         '../source/advanced',
    name:            'iQuery+',
    paths:           {
        jquery:       'http://cdn.bootcss.com/jquery/1.12.3/jquery',
        'jQuery+':    'http://git.oschina.net/Tech_Query/iQuery/raw/master/jQuery+.js'
    },
    out:             '../iQuery+.js',
    onBuildWrite:    function (iName, _, iCode) {
        var fParameter = 'BOM, DOM, $',
            aParameter = 'self, self.document, self.jQuery';

        if (iName.indexOf('iQuery+') > -1)
            return  iCode.replace(/(\/\/\n)\n[\s\S]+/, '$1');

        return iCode
            .replace(/^define[\s\S]+?(function \()[^\)]*/m,  "\n($1" + fParameter)
            .replace(/\s+var BOM.+?;/, '')
            .replace(/\}\).$/,  '})(' + aParameter + ");\n\n");
    },
    wrap:            {
        startFile:    'iQuery+_Wrap.txt',
        end:          '});'
    },
    optimize:        'none'
});