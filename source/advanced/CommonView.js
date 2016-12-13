define(['jquery', 'jQuery+'],  function ($) {

    function CommonView($_View, onInit) {
        var _Self_ = arguments.callee;

        if (!  (this instanceof _Self_))
            return  new _Self_($_View, onInit);

        $_View = $($_View);

        var iView = this.constructor.instanceOf($_View, false)  ||
                $.Observer.call(this, 1);

        if (iView !== this)  return iView;

        this.$_View = $_View.data(this.constructor.getClass(), this);

        if (typeof onInit == 'function')  onInit.call(this);

        return this;
    }

    return  $.CommonView = $.inherit($.Observer, CommonView, {
        getClass:      function () {
            return  this.prototype.toString.call({constructor: this});
        },
        instanceOf:    function (iDOM, Check_Parent) {
            var iName = this.getClass(),  _Instance_,  $_Instance = $(iDOM);

            do {
                _Instance_ = $_Instance.data(iName);

                if (_Instance_ instanceof this)  return _Instance_;

                $_Instance = $_Instance.parent();

            } while ($_Instance[0]  &&  (Check_Parent !== false));
        }
    }, {
        toString:    function () {
            var iName = this.constructor.name;

            iName = (typeof iName == 'function')  ?  this.constructor.name()  :  iName;

            return  '[object ' + iName + ']';
        },
        render:      function () {
            this.trigger('render', arguments);

            return this;
        },
        valueOf:     function () {
            return $.map(
                this.$_View.find('*').addBack().filter('form'),
                function () {
                    return  $.paramJSON('?'  +  $( arguments[0] ).serialize());
                }
            );
        },
        clear:       function () {
            var $_Data = this.$_View.find('*').addBack().filter('form')
                    .one('reset',  function () {
                        arguments[0].stopPropagation();
                    });

            for (var i = 0;  $_Data[i];  i++)
                $_Data[i].reset();

            return this;
        }
    });
});