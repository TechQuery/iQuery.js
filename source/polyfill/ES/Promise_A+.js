define(function () {

    var BOM = self;

    if (BOM.Promise instanceof Function)  return BOM.Promise;

/* ---------- Promise/A+ Core ---------- */

    function Promise() {

        this.__value__ = undefined;

        this.__state__ = -1;

        this.__callback__ = [ ];

        var _This_ = this;

        arguments[0](function () {

            _This_.resolve( arguments[0] );

        },  function () {

            _This_.reject( arguments[0] );
        });
    }

    var __Private__ = { };

    Promise.prototype.reject = function () {

        __Private__.endBy.call(this, 1, arguments[0]);
    };

    Promise.prototype.resolve = function (_Value_) {

        if (_Value_ == this)
            throw  TypeError("Can't return the same Promise object !");

        if (typeof (_Value_ || '').then != 'function')
            return  __Private__.endBy.call(this, 0, _Value_);

        var _This_ = this;

        _Value_.then(function () {

            _This_.resolve( arguments[0] );

        },  function () {

            _This_.reject( arguments[0] );
        });
    };

    __Private__.endBy = function (iState, iValue) {

        if (this.__state__ > -1)  return;

        var _This_ = this;

        setTimeout(function () {

            _This_.__value__ = iValue;

            _This_.__state__ = iState;

            __Private__.exec.call(_This_);
        });
    };

    __Private__.exec = function () {

        var _CB_;

        if (this.__state__ > -1)
            while (_CB_ = this.__callback__.shift())
                if (typeof _CB_[this.__state__]  ==  'function')  try {

                    _CB_[2]( _CB_[this.__state__]( this.__value__ ) );

                } catch (iError) {

                    _CB_[3]( iError );
                }
    };

    Promise.prototype.then = function (iResolve, iReject) {

        var _This_ = this;

        return  new Promise(function () {

            _This_.__callback__.push([
                iResolve,  iReject,  arguments[0],  arguments[1]
            ]);

            __Private__.exec.call(_This_);
        });
    };

/* ---------- ES 6  Promise Helper ---------- */

    Promise.resolve = function (iValue) {

        return  (iValue instanceof this)  ?  iValue  :  new this(function () {

            arguments[0]( iValue );
        });
    };

    Promise.reject = function (iError) {

        return  new this(function () {

            arguments[1]( iError );
        });
    };

    Promise.all = function (iQueue) {

        var iValue = [ ],  iSum = iQueue.length;

        return  iSum  ?  (new this(function (iResolve, iReject) {

            ' '.repeat( iSum ).replace(/ /g,  function (_, Index) {

                Promise.resolve( iQueue[Index] ).then(function () {

                    iValue[ Index ] = arguments[0];

                    if (! --iSum)  iResolve( iValue );

                },  iReject);
            });
        }))  :  this.resolve( iQueue );
    };

    Promise.race = function (iQueue) {

        return  new Promise(function () {

            for (var i = 0;  iQueue[i];  i++)
                Promise.resolve( iQueue[i] ).then(arguments[0], arguments[1]);
        });
    };

    return  BOM.Promise = Promise;

});