define(['Info'],  function ($) {

    var BOM = self;

    $.expr = { };

    var pVisible = {
            display:    'none',
            width:      0,
            height:     0
        },
        Check_Type = $.makeSet('radio', 'checkbox');

    $.expr[':'] = $.expr.filters = {
        visible:     function () {
            var iStyle = BOM.getComputedStyle( arguments[0] );

            for (var iKey in pVisible)
                if (iStyle[iKey] === pVisible[iKey])  return;

            return true;
        },
        hidden:      function () {
            return  (! this.visible(arguments[0]));
        },
        header:      function () {
            return  (arguments[0] instanceof HTMLHeadingElement);
        },
        checked:     function (iDOM) {
            return (
                (iDOM.tagName.toLowerCase() == 'input')  &&
                (iDOM.type in Check_Type)  &&  (iDOM.checked === true)
            );
        },
        parent:      function (iDOM) {

            if (iDOM.children.length)  return true;

            iDOM = iDOM.childNodes;

            for (var i = 0;  iDOM[i];  i++)
                if (iDOM[i].nodeType == 3)  return true;
        },
        empty:       function () {
            return  (! this.parent(arguments[0]));
        },
        contains:    function (iDOM, Index, iMatch) {

            return  (iDOM.textContent.indexOf( iMatch[3] )  >  -1);
        },
        not:         function (iDOM, Index, iMatch) {

            return  (! $.fn.is.call([iDOM], iMatch[3]));
        }
    };

});