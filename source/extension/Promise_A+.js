define(['jquery'],  function ($) {

    var BOM = self;

    if (BOM.Promise)  return BOM.Promise;

    function Promise() {
        this.state = 'pending';
        this.callback = [ ];

        var _This_ = this;

        arguments[0].call(this,  function () {
            _This_.state = 'resolved';
            _This_.value = arguments[0];
        },  function () {
            _This_.state = 'rejected';
            _This_.error = arguments[0];
        });
    }

    Promise.prototype.then = function (onResolved, onRejected) {
        this.callback.push( onResolved );

        var _This_ = this;

        return  new Promise(function (iResolve, iReject) {

            BOM.setTimeout(function () {
                switch (_This_.state) {
                    case 'resolved':    {
                        if (onResolved !== _This_.callback[0])  break;

                        _This_.callback.shift();

                        return  iResolve( onResolved.call(_This_, _This_.value) );
                    }
                    case 'rejected':
                        return  iReject( onRejected.call(_This_, _This_.error) );
                }

                BOM.setTimeout( arguments.callee );
            });
        });
    };

    return  BOM.Promise = Promise;

});