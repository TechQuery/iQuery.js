define(['jquery', 'jQuery+'],  function ($) {

    function CommonView($_View, onInit) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, onInit);

        $_View = $($_View);

        var iView = this.constructor.getInstance($_View) ||
                $.Observer.call(this, 1);

        if (iView !== this)  return iView;

        this.$_View = $_View.data('CVI_' + this.constructor.name,  this);

        if (typeof onInit == 'function')  onInit.call(this);

        return this;
    }

    $.extend(CommonView, {
        getInstance:    function () {
            var _Instance_ = $(arguments[0]).data('CVI_' + this.name);
            return  ((_Instance_ instanceof this)  &&  _Instance_);
        }
    });

    CommonView.prototype = $.extend(new $.Observer(),  {
        constructor:    CommonView,
        render:         function () {
            this.$_View.dataRender(
                this.trigger('render', arguments)  ||  arguments[0]
            );
            return this;
        }
    });

    $.CommonView = CommonView;

});