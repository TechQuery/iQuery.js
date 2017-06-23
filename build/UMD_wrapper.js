(function (name, factory) {

//  AMD shim

    function parsePath(raw) {

        var parsed;    raw = raw.replace(/^\.\//, '').replace(/\/\.\//g, '/');

        do {
            raw = parsed || raw;

            parsed = raw.replace(/[^\/]+\/\.\.\//g, '');

        } while (parsed != raw);

        return parsed;
    }

    var map = { },  last;

    function _define(id, parent, factory) {

        var path = id.replace(/[^\/]+$/, '');

        for (var i = 0;  parent[i];  i++)
            parent[i] = map[ parsePath(path + parent[i]) ];

        last = map[ id ] = factory.apply(null, parent);
    }

//  UMD shim

    var proxy = function () {

            return  factory( _define )  ||  last;
        };

    if ((typeof define === 'function')  &&  define.amd)
        define(name, proxy);
    else if (typeof module === 'object')
        module.exports = proxy();
    else
        this[name] = proxy();

})('/* AMD_ID */',  function (define) {

/* AMD_Buddle */
});