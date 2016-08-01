define(['iCore'],  function ($) {

    function QuerySelector(iPath) {
        var iRoot = this;

        if ((this.nodeType == 9)  ||  (! this.parentNode))
            return iRoot.querySelectorAll(iPath);

        var _ID_ = this.getAttribute('id');

        if (! _ID_) {
            _ID_ = $.uuid('iQS');
            this.setAttribute('id', _ID_);
        }
        iPath = '#' + _ID_ + ' ' + iPath;
        iRoot = this.parentNode;

        iPath = iRoot.querySelectorAll(iPath);

        if (_ID_.slice(0, 3)  ==  'iQS')  this.removeAttribute('id');

        return iPath;
    }

    $.find = function (iSelector, iRoot) {
        var _Self_ = arguments.callee;

        return  $.map(iSelector.split(/\s*,\s*/),  function (_Selector_) {
            var iPseudo = [ ],  _Before_,  _After_ = _Selector_;

            while (! (iPseudo[1] in $.expr[':'])) {
                iPseudo = _After_.match(/:(\w+)(\(('|")?([^'"]*)\3?\))?/);

                if (! iPseudo)
                    return  $.makeArray(QuerySelector.call(iRoot, _Selector_));

                _Before_ = iPseudo.index  ?
                    _After_.slice(0, iPseudo.index)  :  '*';

                _After_ = _After_.slice(iPseudo.index + iPseudo[0].length)
            }

            if (_Before_.match(/[\s>\+~]\s*$/))  _Before_ += '*';

            iPseudo.splice(2, 1);

            return $.map(
                QuerySelector.call(iRoot, _Before_),
                function (iDOM, Index) {
                    if ($.expr[':'][iPseudo[1]](iDOM, Index, iPseudo))
                        return  _Self_(_After_, iDOM);
                }
            );
        });
    };
    $.uniqueSort = $.browser.msie ?
        function (iSet) {
            var $_Temp = [ ],  $_Result = [ ];

            for (var i = 0;  i < iSet.length;  i++) {
                $_Temp[i] = new String(iSet[i].sourceIndex + 1e8);
                $_Temp[i].DOM = iSet[i];
            }
            $_Temp.sort();

            for (var i = 0, j = 0;  i < $_Temp.length;  i++)
                if ((! i)  ||  (
                    $_Temp[i].valueOf() != $_Temp[i - 1].valueOf()
                ) || (
                    $_Temp[i].DOM.outerHTML  !=  $_Temp[i - 1].DOM.outerHTML
                ))
                    $_Result[j++] = $_Temp[i].DOM;

            return $_Result;
        } :
        function (iSet) {
            iSet.sort(function (A, B) {
                return  (A.compareDocumentPosition(B) & 2) - 1;
            });

            var $_Result = [ ];

            for (var i = 0, j = 0;  i < iSet.length;  i++) {
                if (i  &&  (iSet[i] === iSet[i - 1]))  continue;

                $_Result[j++] = iSet[i];
            }

            return $_Result;
        };

});