define(['../../iQuery'],  function ($) {

    function Observer(connect) {

        if (! (this instanceof Observer))  return  new Observer( connect );

        this.__connect__ = connect;

        this.__handle__ = [ ];
    }

    function next() {

        for (var i = 0;  this.__handle__[i];  i++)
            this.__handle__[i]( arguments[0] );
    }

    $.extend(Observer.prototype, {
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

    return  $.Observer = Observer;

});