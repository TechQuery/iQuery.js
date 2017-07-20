define(['../iQuery', '../utility/ext/browser'],  function ($) {

    var BOM = self;

/* ---------- URL Search Parameter ---------- */

    function URLSearchParams() {

        this.length = 0;

        if (arguments[0] instanceof Array) {

            for (var i = 0;  arguments[i];  i++)
                this.append.apply(this, arguments[i]);

            return;
        }

        var _This_ = this;

        arguments[0].replace(/([^\?&=]+)=([^&]+)/g,  function (_, key, value) {

            try {  value = decodeURIComponent( value );  } catch (error) { }

            _This_.append(key, value);
        });
    }

    var ArrayProto = Array.prototype;

    $.extend(URLSearchParams.prototype, {
        append:      function (key, value) {

            ArrayProto.push.call(this,  [key,  value + '']);
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
        delete:      function (key) {

            for (var i = 0;  this[i];  i++)
                if (this[i][0] === key)  ArrayProto.splice.call(this, i, 1);
        },
        set:         function (key, value) {

            if (this.get( key )  != null)  this.delete( key );

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

            for (var i = 0;  entry[i];  i++)  this.delete( entry[i][0] );

            for (var i = 0;  entry[i];  i++)
                this.append(entry[i][0], entry[i][1]);
        };

/* ---------- URL Constructor ---------- */

    BOM.URL = BOM.URL || BOM.webkitURL;

    if (typeof BOM.URL != 'function')  return;


    function URL(path, base) {

        if (! /^\w+:\/\/.{2,}/.test(base || path))
            throw  new TypeError(
                "Failed to construct 'URL': Invalid " +
                (base ? 'base' : '')  +  ' URL'
            );

        var link = this.__data__ = document.createElement('a');

        link.href = base || path;

        if ( base )
            link.href = link.origin + (
                (path[0] === '/')  ?
                    path  :  link.pathname.replace(/[^\/]+$/, path)
            );

        return  $.browser.modern ? this : link;
    }

    URL.prototype.toString = function () {  return this.href;  };

    $.each([
        BOM.location.constructor, BOM.HTMLAnchorElement, BOM.HTMLAreaElement
    ],  function () {

        Object.defineProperties(this.prototype, {
            origin:          function () {

                return  this.protocol + '//' + this.host;
            },
            searchParams:    function () {

                return  new URLSearchParams( this.search );
            }
        });
    });

    if ( $.browser.modern )
        $.each(BOM.location,  function (key) {

            if (typeof this != 'function')
                Object.defineProperty(URL.prototype, key, {
                    get:    function () {

                        return  this.__data__[key];
                    },
                    set:    function () {

                        this.__data__[key] = arguments[0];
                    }
                });
        });

    if ( BOM.URL ) {

        URL.createObjectURL = BOM.URL.createObjectURL;

        URL.revokeObjectURL = BOM.URL.revokeObjectURL;
    }

    BOM.URL = URL;

});