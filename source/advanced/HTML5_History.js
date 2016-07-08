/* ---------- HTML 5  History API  Polyfill ---------- */

define(['jquery', 'jQuery+'],  function ($) {

    var BOM = self,  DOM = self.document;

    if (! ($.browser.msie < 10))  return;

    var _BOM_,  _Pushing_,  _State_ = [[null, DOM.title, DOM.URL]];

    $(DOM).ready(function () {
        var $_iFrame = $('<iframe />', {
                id:     '_HTML5_History_',
                src:    'blank.html',
                css:    {display:  'none'}
            }).appendTo(this.body),
            $_Parent = $(BOM);

        _BOM_ = $_iFrame[0].contentWindow;

        $_iFrame.on('load',  function () {
            if (_Pushing_) {
                _Pushing_ = false;
                return;
            }

            var iState = _State_[ _BOM_.location.search.slice(7) ];
            if (! iState)  return;

            BOM.history.state = iState[0];
            DOM.title = iState[1];

            $_Parent.trigger({
                type:     'popstate',
                state:    iState[0]
            });
        });
    });

    BOM.history.pushState = function (iState, iTitle, iURL) {
        for (var iKey in iState)
            if (! $.isData(iState[iKey]))
                throw ReferenceError("The History State can't be Complex Object !");

        if (typeof iTitle != 'string')
            throw TypeError("The History State needs a Title String !");

        if (_BOM_) {
            DOM.title = iTitle;
            if ($.browser.modern)  _BOM_.document.title = iTitle;
            _Pushing_ = true;
            _BOM_.location.search = 'index=' + (_State_.push(arguments) - 1);
        }
    };

    BOM.history.replaceState = function () {
        _State_ = [ ];
        this.pushState.apply(this, arguments);
    };

});