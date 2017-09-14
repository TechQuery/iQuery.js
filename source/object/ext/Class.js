define(['../../iQuery'],  function ($) {

    function Class(abstract) {

        if ((abstract || Class).prototype  ===  Object.getPrototypeOf( this ))
            throw TypeError([
                'Abstract class',
                (Class.name instanceof Function)  ?
                    this.constructor.name() : this.constructor.name,
                "can't be instantiated"
            ].join(' '));

        return this;
    }

    Class.extend = function (sub, static, proto) {

        for (var key in this)
            if (this.hasOwnProperty( key ))  sub[ key ] = this[ key ];

        $.extend(sub, static);

        sub.prototype = $.extend(
            Object.create( this.prototype ),  sub.prototype,  proto
        );
        sub.prototype.constructor = sub;

        return sub;
    };

    function setPrivate(key, value, config) {

        key = (
            (key === 'length')  ||  Number.isInteger( +key )  ||
            ((typeof value === 'function')  &&  this.hasOwnProperty('constructor'))
        )  ?
            key  :  ('__' + key + '__');

        Object.defineProperty(this, key, $.extend(
            {
                value:           value,
                writable:        true,
                configurable:    true
            },
            config || { }
        ));
    }

    function wrap(method, failback) {

        var _method_ = function (key, value) {
                try {
                    method.apply(this, arguments);

                } catch (error) {
                    if (
                        error.message.split('.')[0] ===
                            'Invalid property descriptor'
                    )
                        throw error;

                    if (failback !== false)  this[ key ] = value;
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

    setPrivate.call(Class.prototype,  'setPrivate',  wrap( setPrivate ));

    setPrivate.call(
        Class.prototype,  'setPublic',  wrap(function (key, Get_Set, config) {

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