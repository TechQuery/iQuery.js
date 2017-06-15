define(['../object/index', './selector'],  function ($, selector) {

    var Check_Type = $.makeSet('radio', 'checkbox');

    $.extend(selector.expr[':'], arguments[2], {
        visible:     function (iDOM) {
            return !!(
                iDOM.offsetWidth || iDOM.offsetHeight || iDOM.getClientRects[0]
            );
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

            return  (! selector.find(iMatch[3], iDOM)[0]);
        }
    });

    return selector;

});