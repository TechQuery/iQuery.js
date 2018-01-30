define(['../../iQuery'],  function ($) {

    /**
     * 类式继承抽象类
     *
     * @author  TechQuery
     *
     * @class   Class
     *
     * @param   {object}   [abstract=Class] - Constructor of Abstract Class
     * @param   {string[]} [method]         - Names of Abstract Methods
     *
     * @returns {Class}
     */

    function Class(abstract, method) {

        abstract = abstract || Class;

        var _class_ = (Class.name instanceof Function)  ?
                abstract.name()  :  abstract.name;

        if (abstract.prototype  ===  Object.getPrototypeOf( this ))
            throw TypeError(
                'Abstract class ' + _class_ + " can't be instantiated"
            );

        if (abstract !== Class)
            Array.from(method,  function (name) {

                this[ name ] = this[ name ]  ||  function () {

                    throw TypeError(
                        'Abstract method ' +
                        _class_ + '.prototype.' + name +
                        " isn't implemented"
                    );
                };
            },  this);

        return this;
    }

    /**
     * 继承出一个子类
     *
     * @author   TechQuery
     *
     * @memberof Class
     *
     * @param    {function} sub     - Constructor of Sub Class
     * @param    {?object}  Static  - Static properties
     * @param    {object}   [proto] - Instance properties
     *
     * @returns  {function} The Sub Class
     */
    Class.extend = function (sub, Static, proto) {

        for (var key in this)
            if (this.hasOwnProperty( key ))  sub[ key ] = this[ key ];

        $.extend(sub, Static);

        sub.prototype = $.extend(
            Object.create( this.prototype ),  sub.prototype,  proto
        );
        sub.prototype.constructor = sub;

        return sub;
    };

    function safeWrap(method, failback) {

        var _method_ = function (key, value) {
                try {
                    method.apply(this, arguments);

                } catch (error) {
                    if (
                        error.message.split('.')[0] ===
                            'Invalid property descriptor'
                    )
                        throw error;

                    if (failback !== false)  this[error.key || key] = value;
                }

                return value;
            };

        return  function (key) {

            key = key.valueOf();

            if (! $.isPlainObject( key ))
                return  _method_.apply(this, arguments);

            for (var name in key)  _method_.call(this,  name,  key[ name ]);

            return this;
        };
    }

    /**
     * 设置私有成员
     *
     * @memberof Class.prototype
     * @function setPrivate
     *
     * @param    {string|object} key      Key or Key-Value
     * @param    {*}             [value]
     * @param    {object}        [config] More config
     *
     * @return   {*}             Value while set one or
     *                           This object when set Key-Value
     */
    var setPrivate = safeWrap(function (key, value, config) {

            key = (
                (key === 'length')  ||  Number.isInteger( +key )  ||  (
                    (typeof value === 'function')  &&
                    this.hasOwnProperty('constructor')
                )
            )  ?  key  :  ('__' + key + '__');

            try {
                Object.defineProperty(this, key, $.extend(
                    {
                        value:       value,
                        writable:    true
                    },
                    config || { }
                ));
            } catch (error) {

                error.key = key;    throw error;
            }
        });

    setPrivate.call(Class.prototype, 'setPrivate', setPrivate);

    /**
     * 设置公开成员
     *
     * @memberof Class.prototype
     * @function setPublic
     *
     * @param    {string|object} key       Key or Key-Value
     * @param    {object}        [Get_Set] Getter & Setter
     * @param    {object}        [config]  More config
     *
     * @return   {object}        Get_Set while set one or
     *                           This object when set Key-Value
     */
    setPrivate.call(
        Class.prototype,  'setPublic',  safeWrap(function (key, Get_Set, config) {

            Object.defineProperty(this, key, $.extend(
                {
                    enumerable:      true,
                    configurable:    true
                },
                config,
                Get_Set
            ));
        },  false)
    );

    return  $.Class = Class;

});
