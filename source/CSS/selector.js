define(['../CSS/ext/var'],  function ($) {

    var uniqueId = $.fn.uniqueId;

    function QuerySelector(iPath) {
        if (
            /[\s>\+~]?#/.test( iPath )  ||
            (this.nodeType === 9)  ||  (! this.parentNode)
        )
            return  this.querySelectorAll( iPath );

        uniqueId.call([ this ]);

        iPath = this.parentNode.querySelectorAll('#' + this.id + ' ' + iPath);

        if ( /^iQuery_[\w\d]+$/.test( this.id ) )  this.removeAttribute('id');

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

    return $.extend({
        find:    find,
        expr:    {':': _Pseudo_,  pseudos: _Pseudo_}
    });
});