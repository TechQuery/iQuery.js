define(function () {

    var BOM = self;

    if (BOM.Promise)  return BOM.Promise;

    function Promise(iMain) {
        var _Self_ = arguments.callee,
            _This_ = {
                state:       -1,
                value:       undefined,
                callback:    [ ]
            };

        this.then = function (onResolve, onReject) {
            return  new _Self_(function (iResolve, iReject) {
                if (_This_.state == -1)
                    _This_.callback.push([
                        onResolve,  onReject,  iResolve,  iReject
                    ]);
                else
                    arguments[_This_.state](_This_.value);
            });
        };

        BOM.setTimeout(function () {
            iMain(function () {
                _Complete_.call(_This_, 0, arguments[0]);
            },  function () {
                _Complete_.call(_This_, 1, arguments[0]);
            });
        });
    }

    function _Complete_(iType) {
        if (this.state > -1)  return;

        this.state = iType;  this.value = arguments[1];

        for (var i = 0, _CB_, _Value_;  this.callback[i];  i++)  try {
            _CB_ = this.callback[i];

            if (typeof _CB_[iType] == 'function') {
                _Value_ = _CB_[iType]( this.value );

                if (_Value_ instanceof Promise)
                    return  _Value_.then(_CB_[2], _CB_[3]);
            } else
                _Value_ = this.value;

            _CB_[2](_Value_);

        } catch (iError) {
            _CB_[3]( iError );
        }
    }

    Promise.all = function (pList) {
        var _Result_ = [ ];

        return  new this(function (iResolved, iReject) {

            ' '.repeat( pList.length ).replace(/ /g,  function (_, Index) {

                pList[Index].then(function () {
                    _Result_[Index] = arguments[0];

                    if (_Result_.length == pList.length)
                        iResolved(_Result_);
                },  iReject);
            });
        });
    };

    return  BOM.Promise = Promise;

});