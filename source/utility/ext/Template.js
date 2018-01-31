define(['../../iQuery', '../../object/ext/Class'],  function ($) {

    /**
     * 字符串模板
     *
     * @class Template
     *
     * @param {string}   raw
     * @param {Array}    [nameList] Name list of the Local variable
     * @param {function} [onChange] Call with New & Old value
     */
    function Template(raw, nameList, onChange) {

        if (! (this instanceof Template))
            return  new Template(raw, nameList, onChange);

        this.setPrivate('raw', raw);

        this.setPrivate('name',  nameList || [ ]);

        this.setPrivate('value', '');

        onChange = (nameList instanceof Array)  ?  onChange  :  nameList;

        this.onChange = (onChange instanceof Function)  ?  onChange  :  null;

        return this.parse();
    }

    try {  eval('``');  } catch (error) {  var Classic = true;  }


    return  $.Template = $.Class.extend.call(Array, Template, null, {
        compile:     function (expression) {

            return  this.push(
                new (Function.prototype.bind.apply(
                    Function,
                    [ null ].concat(this.__name__,  'return ' + expression.trim())
                ))()
            );
        },
        parse:       function () {

            var _this_ = this;

            if ( Classic )
                this.__raw__ = this.__raw__.replace(
                    /\$\{([\s\S]+?)\}/g,  function (_, expression) {

                        return  '${' + (_this_.compile( expression ) - 1) + '}';
                    }
                );
            else
                this.compile('`' + this.__raw__ + '`');

            return this;
        },
        /**
         * 表达式求值
         *
         * @memberof Template.prototype
         *
         * @param {?object} context     Value of `this` in the expression
         * @param {*}       [parameter] One or more value of the Local variable
         *
         * @return {string}
         *
         * @example  // 模板求值
         *
         *     $.Template(
         *         "[ ${this.time} ]  Hello, ${scope.creator}'s ${view.name} !",
         *         ['view', 'scope']
         *     ).evaluate(
         *         {time: '2015-04-30'},
         *         {name: 'iQuery.js'},
         *         {creator: 'TechQuery'}
         *     )
         *
         *     // "[ 2015-04-30 ]  Hello, TechQuery's iQuery.js !"
         */
        evaluate:    function (context, parameter) {

            var _this_ = this;

            parameter = Array.from( arguments ).slice(1);

            var value = Classic ?
                    this.__raw__.replace(/\$\{(\d+)\}/g,  function (_, index) {

                        return  _this_[index].apply(context, parameter);
                    }) :
                    this[0].apply(context, parameter);

            if (value !== this.__value__) {

                if ( this.onChange )  this.onChange(value,  this.__value__);

                this.__value__ = value;
            }

            return value;
        },
        toString:    function () {

            return  this.__value__;
        }
    });
});
