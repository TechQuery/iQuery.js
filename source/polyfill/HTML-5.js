define(['../utility/index', '../utility/ext/browser'],  function ($) {

    var BOM = self,  DOM = self.document,  enumerable = $.Class.enumerable;

/* ---------- Document Current Script ---------- */

    var Stack_Prefix = {
            webkit:     'at ',
            mozilla:    '@',
            msie:       'at Global code \\('
        };

    function Script_URL() {

        try {  throw  new Error('AMD_Loader');  } catch (iError) {

            var iURL;

            for (var iCore in Stack_Prefix)
                if ($.browser[ iCore ]) {

                    iURL = iError.stack.match(RegExp(
                        "\\s+"  +  Stack_Prefix[ iCore ]  +
                            "(http(s)?:\\/\\/[^:]+)"
                    ));

                    return  iURL && iURL[1];
                }
        }
    }

    if (! ('currentScript' in DOM))
        Object.defineProperty(Object.getPrototypeOf( DOM ),  'currentScript',  {
            get:           function () {

                var iURL = ($.browser.msie < 10)  ||  Script_URL();

                for (var i = 0;  DOM.scripts[i];  i++)
                    if ((iURL === true)  ?
                        (DOM.scripts[i].readyState == 'interactive')  :
                        (DOM.scripts[i].src == iURL)
                    )
                        return DOM.scripts[i];
            },
            enumerable:    enumerable
        });

/* ---------- ParentNode Children ---------- */

    function HTMLCollection(DOM_Array) {

        for (var i = 0, j = 0;  DOM_Array[i];  i++)
            if (DOM_Array[i].nodeType === 1) {

                this[j] = DOM_Array[i];

                if ( this[j++].name )  this[this[j - 1].name] = this[j - 1];
            }

        this.length = j;
    }

    HTMLCollection.prototype.item = HTMLCollection.prototype.namedItem =
        function () {
            return  this[ arguments[0] ]  ||  null;
        };

    var Children_Define = {
            get:           function () {

                return  new HTMLCollection( this.childNodes );
            },
            enumerable:    enumerable
        };

    if (! DOM.createDocumentFragment().children)
        Object.defineProperty(
            ($.browser.modern ? DocumentFragment : Document).prototype,
            'children',
            Children_Define
        );

    if (! DOM.head.children[0])
        Object.defineProperty(DOM_Proto, 'children', Children_Define);


/* ---------- Scrolling Element ---------- */

    if (! ('scrollingElement' in DOM))
        Object.defineProperty(DOM, 'scrollingElement', {
            get:           function () {

                return  ($.browser.webkit || (DOM.compatMode == 'BackCompat'))  ?
                    DOM.body  :  DOM.documentElement;
            },
            enumerable:    enumerable
        });

/* ---------- Selected Options ---------- */

    if ($.browser.msie < 12)
        Object.defineProperty(HTMLSelectElement.prototype, 'selectedOptions', {
            get:    function () {
                return  new HTMLCollection(
                    $.map(this.options,  function (iOption) {

                        return  iOption.selected ? iOption : null;
                    })
                );
            }
        });
/* ---------- Element CSS Selector Match ---------- */

    var DOM_Proto = Element.prototype;

    DOM_Proto.matches = DOM_Proto.matches || DOM_Proto.webkitMatchesSelector ||
        DOM_Proto.msMatchesSelector || DOM_Proto.mozMatchesSelector ||
        function () {
            if (! this.parentNode)  $('<div />')[0].appendChild(this);

            return  ($.inArray(
                this,  this.parentNode.querySelectorAll( arguments[0] )
            ) > -1);
        };

/* ---------- DOM Token List ---------- */

    function DOMTokenList(iDOM, iName) {

        this.length = 0;

        this.__Node__ = iDOM.attributes.getNamedItem( iName );

        this.value = (this.__Node__.nodeValue  ||  '').trim();

        $.merge(this, this.value.split(/\s+/));
    }

    var ArrayProto = Array.prototype;

    $.each({
        contains:    function () {

            return  ($.inArray(arguments[0], this)  >  -1);
        },
        add:         function (token) {

            if (this.contains( token ))  return;

            ArrayProto.push.call(this, token);

            updateToken.call( this );
        },
        remove:      function (token) {

            var index = $.inArray(token, this);

            if (index > -1)  ArrayProto.splice.call(this, index, 1);
        },
        toggle:      function (token, force) {

            var has = (typeof force === 'boolean')  ?
                    (! force)  :  this.contains( token );

            this[has ? 'remove' : 'add']( token );

            return  (! has);
        }
    },  function (key, method) {

        DOMTokenList.prototype[ key ]  =  function (token) {

            if ( token.match(/\s+/) )
                throw  (self.DOMException || Error)(
                    [
                        "Failed to execute '" + key + "' on 'DOMTokenList':",
                        "The token provided ('" + token + "') contains",
                        "HTML space characters, which are not valid in tokens."
                    ].join(" "),
                    'InvalidCharacterError'
                );

            token = method.call(this, token);

            if ( method.length )
                this.__Node__.nodeValue = this.value =
                    ArrayProto.join.call(this, ' ');

            return token;
        };
    });

    DOMTokenList.prototype.values = function () {

        return  $.makeIterator( this );
    };

    $.each(['', 'SVG', 'Link', 'Anchor', 'Area'],  function (key, proto) {

        proto += 'Element';

        if (key < 2)
            key = 'class';
        else {
            key = 'rel';    proto = 'HTML' + proto;
        }

        proto = (BOM[ proto ]  ||  '').prototype;

        if ((! proto)  ||  ((key + 'List')  in  proto))
            return;

        Object.defineProperty(proto,  key + 'List',  {
            get:           function () {

                return  new DOMTokenList(this, key);
            },
            enumerable:    enumerable
        });
    });

    if (BOM.DOMTokenList  &&  ($.browser.msie < 12))
        BOM.DOMTokenList.prototype.toggle = DOMTokenList.prototype.toggle;


/* ---------- Document Parse & Serialize ---------- */

    var createXML = ($.browser.msie < 12)  ?
            function (code) {

                var document = DOM.implementation.createDocument(null, null);

                document.async = false;

                document.loadXML( code );

                return document;
            }  :
            function (code, type) {

                var XHR = new XMLHttpRequest();

                XHR.open(
                    'GET',
                    'data:'  +  (type || 'application/xml')  +  ','  +  code,
                    false
                );

                XHR.send();

                return XHR.responseXML;
            },
        _parse_ = DOMParser.prototype.parseFromString;

    function parse(type, code) {
        try {
            return  _parse_.call(new DOMParser(),  code || '',  type);
        } catch (error) { }
    }

    $.each([
        function DOMParser() { },
        function XMLSerializer() { }
    ],  function () {

        if (BOM[ $.Type(new this()) ])  return;

        config.value = this;

        Object.defineProperty(BOM, this.name(), config);
    });

    if (! parse('image/svg+xml'))
        DOMParser.prototype.parseFromString = function (code, type) {

            var document;

            switch ( type ) {
                case 'application/xml':    ;
                case 'image/svg+xml':
                    document = createXML(code, type);    break;
                case 'text/html':          {
                    document = DOM.implementation.createHTMLDocument();

                    document.write( code );
                }
                default:
                    throw  TypeError(type + "isn't supported");
            }

            if ( document.parseError.errorCode )
                document = createXML(
                    '<xml><parsererror>' +
                        '<h3>This page contains the following errors:</h3><div>' +
                            document.parseError.reason +
                    '</div></parsererror></xml>'
                );

            return document;
        };

    if (! ($.browser.msie < 11))  return;

/* ---------- Element Data Set ---------- */

    function DOMStringMap() {

        var iMap = this;

        $.each(arguments[0].attributes,  function () {

            if (! this.nodeName.indexOf('data-'))
                iMap[$.camelCase( this.nodeName.slice(5) )] = this.nodeValue;
        });
    }

    Object.defineProperty(DOM_Proto, 'dataset', {
        get:           function () {

            return  new DOMStringMap( this );
        },
        enumerable:    enumerable
    });

    if (! ($.browser.msie < 10))  return;

/* ---------- Error Useful Information ---------- */

    //  Thanks "Kevin Yang" ---
    //
    //      http://www.imkevinyang.com/2010/01/%E8%A7%A3%E6%9E%90ie%E4%B8%AD%E7%9A%84javascript-error%E5%AF%B9%E8%B1%A1.html

    Error.prototype.valueOf = function () {

        return  $.extend(this, {
            code:       this.number & 0x0FFFF,
            helpURL:    'https://msdn.microsoft.com/en-us/library/1dk3k160(VS.85).aspx'
        });
    };

/* ---------- DOM InnerHTML ---------- */

    var InnerHTML = Object.getOwnPropertyDescriptor(DOM_Proto, 'innerHTML');

    Object.defineProperty(DOM_Proto, 'innerHTML', {
        set:           function (iHTML) {

            if (! (iHTML + '').match(
                /^[^<]*<\s*(head|meta|title|link|style|script|noscript|(!--[^>]*--))[^>]*>/i
            ))
                return  InnerHTML.set.call(this, iHTML);

            InnerHTML.set.call(this,  'IE_Scope' + iHTML);

            var iChild = this.childNodes;

            iChild[0].nodeValue = iChild[0].nodeValue.slice(8);

            if (! iChild[0].nodeValue[0])  this.removeChild( iChild[0] );
        },
        enumerable:    enumerable
    });
});
