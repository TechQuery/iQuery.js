define([
    '../../iQuery', '../../object/ext/Class', '../../utility/ext/browser'
],  function ($, Class) {

    var BOM = self;

/* ---------- URL Search Parameter ---------- */

    function URLSearchParams() {

        this.setPrivate('length', 0);

        var search = arguments[0] || '';

        if (search instanceof Array) {

            for (var i = 0;  arguments[i];  i++)
                this.append.apply(this, arguments[i]);

            return;
        }

        var _This_ = this;

        search.replace(/([^\?&=]+)=([^&]+)/g,  function (_, key, value) {

            try {  value = decodeURIComponent( value );  } catch (error) { }

            _This_.append(key, value);
        });
    }

    Class.extend(URLSearchParams, null, {
        append:      function (key, value) {

            this.setPrivate(this.length++,  [key,  value + '']);
        },
        get:         function (key) {

            for (var i = 0;  this[i];  i++)
                if (this[i][0] === key)  return this[i][1];
        },
        getAll:      function (key) {

            return  $.map(this,  function (_This_) {

                if (_This_[0] === key)  return _This_[1];
            });
        },
        'delete':    function (key) {

            for (var i = 0;  this[i];  i++)
                if (this[i][0] === key)  Array.prototype.splice.call(this, i, 1);
        },
        set:         function (key, value) {

            if (this.get( key )  != null)  this['delete']( key );

            this.append(key, value);
        },
        toString:    function () {

            return  encodeURIComponent(Array.from(this,  function (_This_) {

                return  _This_[0] + '=' + _This_[1];

            }).join('&'));
        },
        entries:     function () {

            return  $.makeIterator( this );
        }
    });

    BOM.URLSearchParams = BOM.URLSearchParams || URLSearchParams;

    BOM.URLSearchParams.prototype.sort =
        BOM.URLSearchParams.prototype.sort  ||  function () {

            var entry = Array.from( this.entries() ).sort(function (A, B) {

                    return  A[0].localeCompare( B[0] )  ||
                        A[1].localeCompare( B[1] );
                });

            for (var i = 0;  entry[i];  i++)  this['delete']( entry[i][0] );

            for (var i = 0;  entry[i];  i++)
                this.append(entry[i][0], entry[i][1]);
        };

/* ---------- URL Constructor ---------- */

    BOM.URL = BOM.URL || BOM.webkitURL;

    if (typeof BOM.URL === 'function')  return;


    var Origin_RE = /^\w+:\/\/.{2,}/;


    function URL(path, base) {

        var link = this.setPrivate('data',  $('<div><a /></div>')[0].firstChild);

        link.href = Origin_RE.test( path )  ?  path  :  base;

        if (! Origin_RE.test( link.href ))
            throw  new TypeError(
                "Failed to construct 'URL': Invalid " +
                (base ? 'base' : '')  +  ' URL'
            );

        if (link.href == base)
            link.href = link.origin + (
                (path[0] === '/')  ?
                    path  :  link.pathname.replace(/[^\/]*$/, path)
            );

        return  $.browser.modern ? this : link;
    }

    Class.extend(URL, null, {
        toString:    function () {  return this.href;  }
    });

    $.each([
        BOM.Location, BOM.HTMLAnchorElement, BOM.HTMLAreaElement
    ],  function () {

        Object.defineProperty(this.prototype, 'origin', {
            get:           function () {

                return  this.protocol + '//' + this.hostname + (
                    ((! this.port) || (this.port == 80))  ?
                        ''  :  (':' + this.port)
                );
            },
            enumerable:    $.browser.modern
        });

        Object.defineProperty(this.prototype, 'searchParams', {
            get:           function () {

                return  new URLSearchParams( this.search );
            },
            enumerable:    $.browser.modern
        });
    });

    if ( $.browser.modern )
        $.each(BOM.location,  function (key) {

            if (typeof this !== 'function')
                Object.defineProperty(URL.prototype, key, {
                    get:             function () {

                        return  this.__data__[key];
                    },
                    set:             (key === 'origin')  ?
                        undefined  :  function () {

                            this.__data__[key] = arguments[0];
                        },
                    enumerable:      true,
                    configurable:    true
                });
        });

    if ( BOM.URL ) {

        URL.createObjectURL = BOM.URL.createObjectURL;

        URL.revokeObjectURL = BOM.URL.revokeObjectURL;
    }

    BOM.URL = URL;

});
