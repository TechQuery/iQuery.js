define(['jquery', 'jQuery+'],  function ($) {

    function CommonView($_View, onInit) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, onInit);

        $_View = $($_View);

        var iView = this.constructor.getInstance($_View) ||
                $.Observer.call(this, 1);

        if (iView !== this)  return iView;

        this.$_View = $_View.data(this.constructor.getClass(), this);

        if (typeof onInit == 'function')  onInit.call(this);

        return this;
    }

    $.extend(CommonView, {
        getClass:       function () {
            return  this.prototype.toString.call({constructor: this});
        },
        getInstance:    function () {
            var _Instance_ = $( arguments[0] ).data( this.getClass(this) );
            return  ((_Instance_ instanceof this)  &&  _Instance_);
        },
        instanceOf:     function (iDOM) {
            var iName = this.getClass();
            var Instance = '*:data("' + iName + '")';

            var $_Instance = $(iDOM).parent(Instance);

            return  ($_Instance[0] ? $_Instance : $(iDOM).parents(Instance))
                .data(iName);
        }
    });

    CommonView.prototype = $.extend(new $.Observer(),  {
        constructor:    CommonView,
        toString:       function () {
            var iName = this.constructor.name;

            iName = (typeof iName == 'function')  ?  this.constructor.name()  :  iName;

            return  '[object ' + iName + ']';
        },
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