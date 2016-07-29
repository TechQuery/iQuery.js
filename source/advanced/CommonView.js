define(['jquery', 'jQuery+'],  function ($) {

    function FuncName(iFunc) {
        var iName = iFunc.name;

        return  (typeof iName == 'function')  ?  iName.call(iFunc)  :  iName;
    }

    function CommonView($_View, onInit) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, onInit);

        $_View = $($_View);

        var iView = this.constructor.getInstance($_View) ||
                $.Observer.call(this, 1);

        if (iView !== this)  return iView;

        this.$_View = $_View.data('CVI_' + FuncName(this.constructor),  this);

        if (typeof onInit == 'function')  onInit.call(this);

        return this;
    }

    $.extend(CommonView, {
        getInstance:    function () {
            var _Instance_ = $(arguments[0]).data('CVI_' + FuncName(this));
            return  ((_Instance_ instanceof this)  &&  _Instance_);
        }
    });

    CommonView.prototype = $.extend(new $.Observer(),  {
        constructor:    CommonView,
        render:         function () {
            this.trigger('render', arguments);

            return this;
        },
        clear:          function () {
            this.$_View.empty();

            return this;
        }
    });

    $.CommonView = CommonView;

});