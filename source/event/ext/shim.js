define(['./base'],  function ($) {

    function from_Input() {

        switch ( self.event.srcElement.tagName.toLowerCase() ) {
            case 'input':       ;
            case 'textarea':    return true;
        }
    }

    $.customEvent('input',  function (DOM) {

        if ('oninput'  in  Object.getPrototypeOf( DOM ))  return;

        return  new Observer(function (next) {

            var handler = {
                    propertychange:    function () {

                        if (self.event.propertyName === 'value')
                            next( DOM.value );
                    },
                    paste:             function () {
                        if (! from_Input())
                            next( self.clipboardData.getData('text') );
                    },
                    keyup:             function () {

                        var iEvent = self.event;    var iKey = iEvent.keyCode;

                        if (
                            from_Input()  ||
                            (iKey < 48)  ||  (iKey > 105)  ||
                            ((iKey > 90)  &&  (iKey < 96))  ||
                            iEvent.ctrlKey  ||  iEvent.shiftKey  ||  iEvent.altKey
                        )
                            return;

                        next( DOM.innerText );
                    }
                };

            for (var type in handler)
                DOM.attachEvent('on' + type,  handler[ type ]);

            return  function () {

                for (var type in handler)
                    DOM.detachEvent('on' + type,  handler[ type ]);
            };
        });
    });
});