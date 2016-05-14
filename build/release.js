({
    baseUrl:                    '../source',
    name:                       'iQuery',
    out:                        '../release/iQuery.min.js',
    generateSourceMaps:         true,
    preserveLicenseComments:    false,
    wrap:                       {
        startFile:    'xWrap_0.frag',
        endFile:      'xWrap_1.frag'
    }
});