define(['../object/index', '../utility/ext/timer'],  function ($, timer) {

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

    return {
        find:    find,
        expr:    {':': _Pseudo_,  filter: _Pseudo_}
    };
});