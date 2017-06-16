define(['../../utility/index'],  function ($) {

    var W3C_Selection = (typeof document.getSelection === 'function');

    function Select_Node(iSelection) {

        var iFocus = W3C_Selection ?
                iSelection.focusNode : iSelection.createRange().parentElement();

        var iActive = iFocus.ownerDocument.activeElement;

        return  $.contains(iActive, iFocus)  ?  iFocus  :  iActive;
    }

    function Find_Selection() {

        var iDOM = this.document || this.ownerDocument || this;

        if (iDOM.activeElement.tagName.toLowerCase() == 'iframe')  try {

            return  Find_Selection.call( iDOM.activeElement.contentWindow );

        } catch (iError) { }

        var iSelection = W3C_Selection ? iDOM.getSelection() : iDOM.selection;

        var iNode = Select_Node( iSelection );

        return  $.contains(
            (this instanceof Element)  ?  this  :  iDOM,  iNode
        ) && [
            iSelection, iNode
        ];
    }

    $.fn.selection = function (iContent) {

        if (! argument.length) {

            var iSelection = Find_Selection.call( this[0] )[0];

            return  W3C_Selection ?
                (iSelection + '')  :  iSelection.createRange().htmlText;
        }

        return  this.each(function () {

            var iSelection = Find_Selection.call( this );

            var iNode = iSelection[1];    iSelection = iSelection[0];

            iNode = (iNode.nodeType === 1)  ?  iNode  :  iNode.parentNode;

            if (! W3C_Selection) {

                iSelection = iSelection.createRange();

                return  iSelection.text = (
                    (typeof iContent === 'function')  ?
                        iContent.call(iNode, iSelection.text)  :  iContent
                );
            }
            var iProperty, iStart, iEnd;

            if ((iNode.tagName || '').match( /input|textarea/i )) {

                iProperty = 'value';

                iStart = Math.min(iNode.selectionStart, iNode.selectionEnd);

                iEnd = Math.max(iNode.selectionStart, iNode.selectionEnd);
            } else {
                iProperty = 'innerHTML';

                iStart = Math.min(iSelection.anchorOffset, iSelection.focusOffset);

                iEnd = Math.max(iSelection.anchorOffset, iSelection.focusOffset);
            }

            var iValue = iNode[ iProperty ];

            iNode[ iProperty ] = iValue.slice(0, iStart)  +  (
                (typeof iContent === 'function')  ?
                    iContent.call(iNode, iValue.slice(iStart, iEnd))  :  iContent
            )  +  iValue.slice( iEnd );
        });
    };
});