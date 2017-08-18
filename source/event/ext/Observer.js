define(['../../iQuery', '../../object/ext/Class'],  function ($) {

    function Observer(connect) {

        if (! (this instanceof Observer))  return  new Observer( connect );

        this.setPrivate({
            connect:    connect,
            handle:     [ ],
            'break':    null
        });
    }

    function next() {

        for (var i = 0;  this.__handle__[i];  i++)
            this.__handle__[i]( arguments[0] );
    }

    return  $.Observer = $.Class.extend(Observer, null, {
        listen:    function (callback) {

            if (this.__handle__.indexOf( callback )  <  0) {

                this.__handle__.push( callback );

                if (! this.__handle__[1])
                    this.__break__ = this.__connect__( $.proxy(next, this) );
            }

            return this;
        },
        cancel:    function (callback) {

            this.__handle__.splice(
                this.__handle__.indexOf( callback ),  1
            );

            if (! this.__handle__[0])  this.__break__();

            return this;
        },
        clear:     function () {

            this.__handle__.length = 0;

            this.__break__();

            return this;
        }
    });
});