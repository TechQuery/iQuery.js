define(['../iQuery', '../polyfill/HTML-5'],  function ($) {

    $.fn.hasClass = function (iName) {

        return  Boolean($.map(this,  function () {

            if (arguments[0].classList.contains( iName ))  return 1;
        })[0]);
    };

    $.each(['add', 'remove', 'toggle'],  function (_, key) {

        $.fn[key + 'Class'] = function (CSS_Class, toggle) {

            CSS_Class = CSS_Class && CSS_Class.valueOf();

            switch (typeof CSS_Class) {
                case 'string':      CSS_Class = CSS_Class.trim().split(/\s+/);
                case 'function':    break;
                case 'boolean':     toggle = CSS_Class;    break;
                default:
                    if (key === 'remove')
                        CSS_Class = '';
                    else
                        return this;
            }

            return  this.each(function (index) {

                var list = this.classList;

                CSS_Class = CSS_Class || list.value;

                if (CSS_Class instanceof Function)
                    list[ key ](CSS_Class.call(this, index, list.value),  toggle);
                else
                    for (var i = 0;  CSS_Class[i];  i++)
                        list[ key ](CSS_Class[i], toggle);
            });
        };
    });
});