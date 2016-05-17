define(['jquery'],  function ($) {

    var BOM = self,  DOM = self.document;

    if (! ($.browser.msie < 11))  return;


    /* ----- Element Data Set ----- */

    function DOMStringMap(iElement) {
        for (var i = 0, iAttr;  i < iElement.attributes.length;  i++) {
            iAttr = iElement.attributes[i];
            if (iAttr.nodeName.slice(0, 5) == 'data-')
                this[ iAttr.nodeName.slice(5).toCamelCase() ] = iAttr.nodeValue;
        }
    }

    Object.defineProperty(Element.prototype, 'dataset', {
        get:    function () {
            return  new DOMStringMap(this);
        }
    });


    if (! ($.browser.msie < 10))  return;

    /* ----- Error Useful Information ----- */

    //  Thanks "Kevin Yang" ---
    //
    //      http://www.imkevinyang.com/2010/01/%E8%A7%A3%E6%9E%90ie%E4%B8%AD%E7%9A%84javascript-error%E5%AF%B9%E8%B1%A1.html

    Error.prototype.valueOf = function () {
        return  $.extend(this, {
            code:       this.number & 0x0FFFF,
            helpURL:    'https://msdn.microsoft.com/en-us/library/1dk3k160(VS.85).aspx'
        });
    };

    /* ----- DOM Class List ----- */

    function DOMTokenList() {
        var iClass = (arguments[0].getAttribute('class') || '').trim().split(/\s+/);

        $.extend(this, iClass);

        this.length = iClass.length;
    }

    DOMTokenList.prototype.contains = function (iClass) {
        if (iClass.match(/\s+/))
            throw  new DOMException([
                "Failed to execute 'contains' on 'DOMTokenList': The token provided (",
                iClass,
                ") contains HTML space characters, which are not valid in tokens."
            ].join("'"));

        return  (Array.prototype.indexOf.call(this, iClass) > -1);
    };

    Object.defineProperty(Element.prototype, 'classList', {
        get:    function () {
            return  new DOMTokenList(this);
        }
    });

    /* ----- History API ----- */

    var _BOM_,      $_BOM = $(BOM),
        _Pushing_,  _State_ = [[null, DOM.title, DOM.URL]];

    $(DOM).ready(function () {
        var iFrame = $('#_iQuery_SandBox_')[0];

        _BOM_ = iFrame.contentWindow;

        iFrame.onload = function () {
            if (_Pushing_) {
                _Pushing_ = false;
                return;
            }

            var iState = _State_[ _BOM_.location.search.slice(7) ];
            if (! iState)  return;

            BOM.history.state = iState[0];
            DOM.title = iState[1];

            $_BOM.trigger({
                type:     'popstate',
                state:    iState[0]
            });
        };
    });

    BOM.history.pushState = function (iState, iTitle, iURL) {
        for (var iKey in iState)
            if (! $.isData(iState[iKey]))
                throw ReferenceError("The History State can't be Complex Object !");

        if (typeof iTitle != 'string')
            throw TypeError("The History State needs a Title String !");

        _BOM_.document.title = DOM.title = iTitle;
        _Pushing_ = true;
        _BOM_.location.search = 'index=' + (_State_.push(arguments) - 1);
    };

    BOM.history.replaceState = function () {
        _State_ = [ ];
        this.pushState.apply(this, arguments);
    };

});