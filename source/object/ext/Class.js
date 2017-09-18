define(['../../iQuery'],  function ($) {

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

    $.extend(Class, {
        extend:        function (sub, static, proto) {

            for (var key in this)
                if (this.hasOwnProperty( key ))  sub[ key ] = this[ key ];

            $.extend(sub, static);

            sub.prototype = $.extend(
                Object.create( this.prototype ),  sub.prototype,  proto
            );
            sub.prototype.constructor = sub;

            return sub;
        },
        enumerable:    (!! $.browser.modern)
    });

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
                        value:           value,
                        writable:        true,
                        configurable:    true
                    },
                    config || { }
                ));
            } catch (error) {

                error.key = key;    throw error;
            }
        });

    setPrivate.call(Class.prototype, 'setPrivate', setPrivate);

    setPrivate.call(
        Class.prototype,  'setPublic',  safeWrap(function (key, Get_Set, config) {

            Object.defineProperty(this, key, $.extend(
                {
                    enumerable:      Class.enumerable,
                    configurable:    true
                },
                config,
                Get_Set
            ));
        },  false)
    );

    return  $.Class = Class;

});