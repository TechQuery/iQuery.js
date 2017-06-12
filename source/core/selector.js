define(['./ObjectKit', '../utility/ext/timer'],  function ($, timer) {

    function QuerySelector(iPath) {

        if ((this.nodeType == 9)  ||  (! this.parentNode))
            return  this.querySelectorAll( iPath );

        var _ID_ = this.getAttribute('id');

        if (! _ID_)  this.setAttribute('id',  _ID_ = timer.uuid('iQS'));

        iPath = '#' + _ID_ + ' ' + iPath;

        iPath = this.parentNode.querySelectorAll( iPath );

        if (_ID_.slice(0, 3)  ==  'iQS')  this.removeAttribute('id');

        return iPath;
    }

    var _Pseudo_ = { };

    function find(iSelector, iRoot) {

        return  $.map(iSelector.split(/\s*,\s*/),  function (_Selector_) {

            var iPseudo = [ ],  _Before_,  _After_ = _Selector_;

            while (! (iPseudo[1] in _Pseudo_)) {

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
                QuerySelector.call(iRoot, _Before_),  function (iDOM, Index) {

                    if (_Pseudo_[ iPseudo[1] ](iDOM, Index, iPseudo))
                        return  find(_After_, iDOM);
                }
            );
        });
    }

    var pVisible = {
            display:    'none',
            width:      0,
            height:     0
        },
        Check_Type = $.makeSet('radio', 'checkbox');

    $.extend(_Pseudo_, {
        visible:     function (iDOM) {
            return !!(
                iDOM.offsetWidth || iDOM.offsetHeight || iDOM.getClientRects[0]
            );
        },
        hidden:      function () {
            return  (! this.visible(arguments[0]));
        },
        header:      function () {
            return  (arguments[0] instanceof HTMLHeadingElement);
        },
        checked:     function (iDOM) {
            return (
                (iDOM.tagName.toLowerCase() == 'input')  &&
                (iDOM.type in Check_Type)  &&  (iDOM.checked === true)
            );
        },
        parent:      function (iDOM) {

            if (iDOM.children.length)  return true;

            iDOM = iDOM.childNodes;

            for (var i = 0;  iDOM[i];  i++)
                if (iDOM[i].nodeType == 3)  return true;
        },
        empty:       function () {
            return  (! this.parent(arguments[0]));
        },
        contains:    function (iDOM, Index, iMatch) {

            return  (iDOM.textContent.indexOf( iMatch[3] )  >  -1);
        },
        not:         function (iDOM, Index, iMatch) {

            return  (! find(iMatch[3], iDOM)[0]);
        }
    });

    return {
        find:    find,
        expr:    {':': _Pseudo_,  filter: _Pseudo_}
    };
});