define(['../../iQuery', '../utility'],  function ($) {

    $.buildFragment = $.buildFragment  ||  function (iNode) {

        var iFragment = (arguments[1] || document).createDocumentFragment();

        for (var i = 0;  iNode[i];  i++)  iFragment.appendChild( iNode[i] );

        return iFragment;
    };

/* ---------- Insert by Index ---------- */

    $.fn.insertTo = function ($_Target, Index) {

        var DOM_Set = $.buildFragment(this, document),  $_This = [ ];

        $( $_Target ).each(function () {

            DOM_Set = arguments[0]  ?  DOM_Set.cloneNode( true )  :  DOM_Set;

            $.merge($_This, DOM_Set.children);

            this.insertBefore(DOM_Set,  this.children[Index || 0]);
        });

        return  this.pushStack( $_This );
    };

/* ---------- DOM Tree Iterator ---------- */

    $.fn.treeWalker = function (nodeType, filter) {

        if (nodeType instanceof Function)
            filter = nodeType,  nodeType = 0;
        else
            filter = (typeof filter === 'function')  ?  filter  :  '';

        var element = (nodeType === 1)  ?  'Element'  :  '',  _This_,  _Root_;

        var FC = 'first' + element + 'Child',  NS = 'next' + element + 'Sibling';

        _This_ = _Root_ = this[0];

        return {
            forward:    function (noChild) {

                if ((! noChild)  &&  _This_[ FC ])
                    return  _This_ = _This_[ FC ];

                _This_ = (_This_ != _Root_)  &&  _This_;

                while (_This_) {

                    if (_This_[ NS ])  return  _This_ = _This_[ NS ];

                    _This_ = (_This_.parentNode != _Root_)  &&  _This_.parentNode;
                }
            },
            replace:    function (iNew) {

                iNew = $.buildFragment(
                    (iNew instanceof Element)  ?
                        [ iNew ]  :  $.makeArray( iNew )
                );

                if (! iNew.childNodes[0])  return;

                _This_.parentNode.replaceChild(
                    [iNew,  iNew = iNew.childNodes[0]][0],  _This_
                );

                _This_ = iNew;
            },
            next:       function () {

                if (! _This_)  return  {done: true};

                var iNew = filter  &&  filter.call(_Root_, _This_);

                if (iNew  &&  (iNew != _This_)  &&  _This_.parentNode)
                    this.replace( iNew );
                else if (iNew === false)
                    this.forward();

                if (! _This_)  return  {done: true};

                var item = {value: _This_,  done: false};

                this.forward(iNew === null);

                return item;
            }
        };
    };
/* ---------- HTML with Script Executable ---------- */

    $.fn.htmlExec = function (HTML, selector) {

        this.empty();

        var $_Box = $('<div />');

        $_Box[0].innerHTML = HTML;

        return  (! selector)  ?
            this.each(function () {

                $_Box = $( $_Box[0].cloneNode( true ) );

                var walker = $_Box.treeWalker(1,  function (iDOM) {

                        if (iDOM.tagName.toLowerCase() != 'script')  return;

                        var iAttr = { };

                        $.each(iDOM.attributes,  function () {

                            iAttr[ this.nodeName ] = this.nodeValue;
                        });

                        return  $('<script />',  iAttr)[0];
                    });

                while (! walker.next().done)  ;

                $_Box.children().insertTo( this );
            })  :
            $_Box.find( selector ).insertTo( this );
    };

});