define(function () {

    var BOM = self;

    if (BOM.Promise)  return BOM.Promise;

    function Promise(iMain) {
        var _Self_ = arguments.callee,
            _This_ = {
                _public_:    this,
                state:       -1,
                value:       undefined,
                callback:    [ ]
            };

        this.then = function (onResolve, onReject) {
            return  new _Self_(function (iResolve, iReject) {
                var _CB_ = [onResolve, onReject, iResolve, iReject];

                if (_This_.state == -1)
                    _This_.callback.push(_CB_);
                else
                    _Complete_.call(_This_, _CB_);
            });
        };

        BOM.setTimeout(function () {
            iMain(function () {
                _Complete_All_.call(_This_, 0, arguments[0]);
            },  function () {
                _Complete_All_.call(_This_, 1, arguments[0]);
            });
        });
    }

    function _Complete_(_CB_) {
        var _Value_;

        try {
            if (typeof _CB_[this.state] == 'function') {
                _Value_ = _CB_[this.state]( this.value );

                if (_Value_ === this._public_)
                    throw  TypeError("Can't return the same Promise object !");

                if (typeof (_Value_ || '').then  ==  'function')
                    return  _Value_.then(_CB_[2], _CB_[3]);
            } else
                _Value_ = this.value;

            _CB_[2](_Value_);

        } catch (iError) {
            _CB_[3]( iError );
        }
    }

    function _Complete_All_(iType) {
        if (this.state > -1)  return;

        this.state = iType;  this.value = arguments[1];

        while ( this.callback[0] )
            _Complete_.call(this, this.callback.shift());
    }

    Promise.resolve = function (iValue) {
        if (iValue instanceof this)  return iValue;

        if (typeof (iValue || '').then  ==  'function')
            return  new this(function () {
                iValue.then.apply(iValue, arguments);
            });

        return  new this(function (iResolve) {
            BOM.setTimeout(function () {
                iResolve(iValue);
            });
        });
    };

    Promise.reject = function (iValue) {
        if (typeof (iValue || '').then  ==  'function')
            return  new this(function () {
                iValue.then.apply(iValue, arguments);
            });

        return  new this(function (_, iReject) {
            BOM.setTimeout(function () {
                iReject(iValue);
            });
        });
    };

    Promise.all = function (pList) {
        var _Result_ = [ ];

        for (var i = 0;  i < pList.length;  i++)
            if ((! pList[i])  ||  (typeof pList[i].then != 'function'))
                pList[i] = this.resolve( pList[i] );

        return  i  ?  new this(function (iResolved, iReject) {

            ' '.repeat( pList.length ).replace(/ /g,  function (_, Index) {

                pList[Index].then(function () {
                    _Result_[Index] = arguments[0];

                    if (_Result_.length == pList.length)
                        iResolved(_Result_);
                },  iReject);
            });
        })  :  this.resolve(pList);
    };

    return  BOM.Promise = Promise;

});
