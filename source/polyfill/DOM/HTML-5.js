define([
    '../../iQuery', '../../object/ext/advanced', '../../utility/ext/browser',
    '../../utility/index'
],  function ($) {

    var BOM = self,  DOM = self.document;

    var enumerable = $.browser.modern, Trident = ($.browser.msie < 12);

/* ---------- Document Current Script ---------- */

    var Stack_Prefix = {
            webkit:     'at ',
            mozilla:    '@',
            msie:       'at Global code \\('
        };

    function Script_URL() {

        try {  throw  new Error('AMD_Loader');  } catch (error) {

            var URI;

            for (var core in Stack_Prefix)
                if ($.browser[ core ]) {

                    URI = error.stack.match(RegExp(
                        "\\s+"  +  Stack_Prefix[ core ]  +
                            "(http(s)?:\\/\\/[^:]+)"
                    ));

                    return  URI && URI[1];
                }
        }
    }

    if (! ('currentScript' in DOM))
        Object.defineProperty(Document.prototype,  'currentScript',  {
            get:           function () {

                var scripts = this.scripts,
                    URI = ($.browser.msie < 10)  ||  Script_URL();

                for (var i = 0;  script[i];  i++)
                    if ((URI === true)  ?
                        (scripts[i].readyState === 'interactive')  :
                        (scripts[i].src === URI)
                    )
                        return scripts[i];
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
        },
        DOM_Proto = Element.prototype;

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
        Object.defineProperty(Document.prototype, 'scrollingElement', {
            get:           function () {

                return  ($.browser.webkit || (DOM.compatMode == 'BackCompat'))  ?
                    DOM.body  :  DOM.documentElement;
            },
            enumerable:    enumerable
        });

/* ---------- DOM manipulation ---------- */

    var DOM_method = {
            remove:         enumerable ?
                function () {

                    if ( this.parentNode )  this.parentNode.removeChild( this );
                } :
                $.proxy(Element.prototype.removeNode, null, true),
            replaceWith:    function () {

                if ( this.parentNode )
                    this.parentNode.replaceChild(
                        $.buildFragment($.map(arguments,  function (node) {

                            switch ($.Type( node )) {
                                case 'String':
                                    return  document.createTextNode( node );
                                case 'Text':           ;
                                case 'HTMLElement':    ;
                                case 'Comment':
                                    return  node;
                            }
                        })),
                        this
                    );
            }
        };

    $.each([Element, Text, Comment],  function () {

        $.patch(this.prototype,  DOM_method);
    });

/* ---------- Element CSS Selector Match ---------- */

    DOM_Proto.matches = DOM_Proto.matches || DOM_Proto.webkitMatchesSelector ||
        DOM_Proto.msMatchesSelector || DOM_Proto.mozMatchesSelector ||
        function () {
            if (! this.parentNode)  $('<div />')[0].appendChild(this);

            return  ($.inArray(
                this,  this.parentNode.querySelectorAll( arguments[0] )
            ) > -1);
        };

/* ---------- Selected Options ---------- */

    if ( Trident )
        Object.defineProperty(HTMLSelectElement.prototype, 'selectedOptions', {
            get:           function () {

                return  new HTMLCollection(
                    $.map(this.options,  function (option) {

                        return  option.selected ? option : null;
                    })
                );
            },
            enumerable:    enumerable
        });

/* ---------- DOM Token List ---------- */

    function DOMTokenList(element, name) {

        this.length = 0;

        this.__Node__ = element.attributes.getNamedItem( name );

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

    if (BOM.DOMTokenList && Trident)
        BOM.DOMTokenList.prototype.toggle = DOMTokenList.prototype.toggle;


/* ---------- Document Parse ---------- */

    var createXML = Trident ?
            function (code) {

                var document = DOM.implementation.createDocument(null, null, null);

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
        _parse_ = BOM.DOMParser && BOM.DOMParser.prototype.parseFromString;

    function DOMParser() { }

    function parse(type, code) {
        try {
            return  _parse_.call(new BOM.DOMParser(),  code || '',  type);
        } catch (error) { }
    }

    if (! BOM.DOMParser)
        Object.defineProperty(BOM, 'DOMParser', {
            value:         DOMParser,
            enumerable:    true
        });

    if (! parse('text/html'))
        BOM.DOMParser.prototype.parseFromString = _parse_ = function (code, type) {

            var document;

            switch ( type ) {
                case 'application/xml':    ;
                case 'image/svg+xml':
                    document = createXML(code, type);    break;
                case 'text/html':          {
                    document = DOM.implementation.createHTMLDocument('');

                    document.createElement('html');

                    document.write( code );    document.close();
                    break;
                }
                default:
                    throw  TypeError(type + " isn't supported");
            }

            if ((document.parseError || '').errorCode)
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

        var map = this;

        $.each(arguments[0].attributes,  function () {

            if (! this.nodeName.indexOf('data-'))
                map[$.camelCase( this.nodeName.slice(5) )] = this.nodeValue;
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
        set:           function (HTML) {

            if (! (HTML + '').match(
                /^[^<]*<\s*(head|meta|title|link|style|script|noscript|(!--[^>]*--))[^>]*>/i
            ))
                return  InnerHTML.set.call(this, HTML);

            InnerHTML.set.call(this,  'IE_Scope' + HTML);

            var child = this.childNodes;

            child[0].nodeValue = child[0].nodeValue.slice(8);

            if (! child[0].nodeValue[0])  child[0].remove();
        },
        enumerable:    enumerable
    });
});
