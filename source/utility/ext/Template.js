define(['../../iQuery', '../../object/ext/Class'],  function ($) {

    /**
     * 字符串模板
     *
     * @class Template
     *
     * @param {string}   raw
     * @param {Array}    [nameList] Name list of the Local variable
     * @param {function} [onChange] Call with New & Old value
     * @param {Array}    [bindData] The parameter bound to `onChange`
     *
     * @example  // 局部变量成员名
     *
     *     $.Template('[ ${new Date()} ]  Hello, ${this.name} !')[0]    // 'name'
     */

    function Template(raw, nameList, onChange, bindData) {

        if (! (this instanceof Template))
            return  new Template(raw, nameList, onChange, bindData);

        this.setPrivate({
            raw:           raw,
            name:          nameList || [ ],
            expression:    [ ],
            value:         '',
            data:          bindData || [ ]
        }).setPrivate(
            'scope',  $.makeSet.apply($,  this.__name__.concat('this'))
        );

        onChange = (nameList instanceof Array)  ?  onChange  :  nameList;

        this.onChange = (onChange instanceof Function)  ?  onChange  :  null;

        this.parse().evaluate.apply(
            this,  Array.from(Object.keys(this.__scope__),  function () {

                return  { };
            })
        );
    }

    return  $.Template = $.Class.extend.call(Array, Template, {
        Expression:    /\$\{([\s\S]+?)\}/g,
        Reference:     /(\w+)(?:\.(\w+)|\[(?:'([^']+)|"([^"]+)))/g
    }, {
        compile:     function (expression) {

            return  this.__expression__.push(
                new (Function.prototype.bind.apply(
                    Function,
                    [ null ].concat(this.__name__,  'return ' + expression.trim())
                ))()
            );
        },
        parse:       function () {

            var _this_ = this;

            function addReference(match, scope, key1, key2, key3) {

                if (scope  in  _this_.__scope__)
                    _this_.push(key1 || key2 || key3);
            }

            this.__raw__ = this.__raw__.replace(
                Template.Expression,  function (_, expression) {

                    expression.replace(Template.Reference, addReference);

                    return  '${' + (_this_.compile( expression ) - 1) + '}';
                }
            );

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

            var expression = this.__expression__;

            parameter = Array.from( arguments ).slice(1);

            var value = this.__raw__.replace(
                    /\$\{(\d+)\}/g,  function (_, index) {

                        return  expression[ index ].apply(context, parameter);
                    }
                );

            if (value !== this.__value__) {

                if ( this.onChange )
                    this.onChange.apply(
                        this,  this.__data__.concat(value,  this.__value__)
                    );

                this.__value__ = value;
            }

            return value;
        },
        toString:    function () {

            return  this.__value__;
        }
    });
});
