define(['extension/iTimer'],  function ($) {

    var BOM = self,  DOM = self.document;


/* ---------- DOM Info Operator - Get first, Set all. ---------- */

    var _DOM_ = {
            TypeMap:          {
                element:    $.makeSet('Window', 'Document', 'HTMLElement'),
                root:       $.makeSet('Document', 'Window')
            },
            Get_Name_Type:    $.makeSet('string', 'array', 'undefined'),
            operate:          function (iType, iElement, iName, iValue) {
                if (iValue === null) {
                    if (this[iType].clear)
                        for (var i = 0;  i < iElement.length;  i++)
                            this[iType].clear(iElement[i], iName);
                    return iElement;
                }
                if (
                    (iValue === undefined)  &&
                    ($.type(iName) in this.Get_Name_Type)
                ) {
                    if (! iElement.length)  return;

                    if (iName instanceof Array) {
                        var iData = { };
                        for (var i = 0;  i < iName.length;  i++)
                            iData[iName[i]] = this[iType].get(iElement[0], iName[i]);
                        return iData;
                    }
                    return  this[iType].get(iElement[0], iName);
                }

                if (typeof iName == 'string') {
                    if (typeof iValue == 'function') {
                        for (var i = 0;  i < iElement.length;  i++)
                            this[iType].set(iElement[i], iName, iValue.call(
                                iElement[i],  i,  this[iType].get(iElement[i], iName)
                            ));
                        return iElement;
                    } else {
                        var _Value_ = { };
                        _Value_[iName] = iValue;
                        iName = _Value_;
                    }
                }
                for (var i = 0;  i < iElement.length;  i++)
                    for (var iKey in iName)
                        this[iType].set(iElement[i], iKey, iName[iKey]);

                return iElement;
            }
        };

    /* ----- DOM Attribute ----- */
    _DOM_.Attribute = {
        get:      function (iElement, iName) {
            if ($.Type(iElement) in _DOM_.TypeMap.root)  return;

            if (! iName)  return iElement.attributes;

            var iValue = iElement.getAttribute(iName);
            if (iValue !== null)  return iValue;
        },
        set:      function (iElement, iName, iValue) {
            if (
                (! ($.Type(iElement) in _DOM_.TypeMap.root))  &&
                (iValue !== undefined)
            )
                iElement.setAttribute(iName, iValue);
        },
        clear:    function (iElement, iName) {
            iElement.removeAttribute(iName);
        }
    };

    /* ----- DOM Property ----- */
    _DOM_.Property = {
        get:    function (iElement, iName) {
            return  iName ? iElement[iName] : iElement;
        },
        set:    function (iElement, iName, iValue) {
            iElement[iName] = iValue;
        }
    };

    /* ----- DOM Style ----- */
    _DOM_.Style = {
        get:    function (iElement, iName) {
            if ((! iElement)  ||  ($.Type(iElement) in _DOM_.TypeMap.root))
                return;

            var iStyle = DOM.defaultView.getComputedStyle(iElement, null);

            if (iName && iStyle) {
                iStyle = iStyle.getPropertyValue(iName);

                if (! iStyle) {
                    if (iName.match( $.cssPX ))
                        iStyle = 0;
                } else if (iStyle.indexOf(' ') == -1) {
                    var iNumber = parseFloat(iStyle);
                    iStyle = isNaN(iNumber) ? iStyle : iNumber;
                }
            }
            return  $.isData(iStyle) ? iStyle : '';
        },
        set:    function (iElement, iName, iValue) {
            if ($.Type(iElement) in _DOM_.TypeMap.root)  return false;

            if ($.isNumeric(iValue) && iName.match($.cssPX))
                iValue += 'px';

            iElement.style.setProperty(iName, String(iValue), 'important');
        }
    };

    /* ----- DOM Data ----- */
    _DOM_.Data = {
        _Data_:    [ ],
        set:       function (iElement, iName, iValue) {
            if (typeof iElement.dataIndex != 'number')
                iElement.dataIndex = this._Data_.push({ }) - 1;

            this._Data_[iElement.dataIndex][iName] = iValue;
        },
        get:       function (iElement, iName) {
            var iData = this._Data_[iElement.dataIndex] || iElement.dataset;

            if (iName) {
                iData = iData || { };
                iData = iData[iName]  ||  iData[ iName.toCamelCase() ];

                if (typeof iData == 'string')  try {
                    iData = BOM.JSON.parseAll(iData);
                } catch (iError) { }
            }

            return  ((iData instanceof Array)  ||  $.isPlainObject(iData))  ?
                    $.extend(true, null, iData)  :  iData;
        },
        clear:     function (iElement, iName) {
            if (typeof iElement.dataIndex != 'number')  return;

            if (iName)
                delete this._Data_[iElement.dataIndex][iName];
            else {
                delete this._Data_[iElement.dataIndex];
                delete iElement.dataIndex;
            }
        }
    };

/* ---------- DOM Selector ---------- */
    var iPseudo = {
            ':header':     {
                filter:    function () {
                    return  (arguments[0] instanceof HTMLHeadingElement);
                }
            },
            ':image':      {
                feature:    $.extend($.makeSet(
                    'img', 'svg', 'canvas'
                ), {
                    input:    {type:  'image'},
                    link:     {type:  'image/x-icon'}
                }),
                filter:    function (iElement) {
                    var iTag = iElement.tagName.toLowerCase();

                    if (iTag in this.feature)
                        return  (this.feature[iTag] instanceof Boolean) ? true : (
                            this.feature[iTag].type == iElement.type.toLowerCase()
                        );
                }
            },
            ':button':     {
                feature:    $.makeSet(
                    'button', 'image', 'submit', 'reset'
                ),
                filter:     function (iElement) {
                    var iTag = iElement.tagName.toLowerCase();

                    return  ((iTag == 'button') || (
                        (iTag == 'input') &&
                        (iElement.type.toLowerCase() in this.feature)
                    ));
                }
            },
            ':input':      {
                feature:    $.makeSet(
                    'input', 'textarea', 'button', 'select'
                ),
                filter:     function (iDOM) {
                    return (
                        (iDOM.tagName.toLowerCase() in this.feature)  ||
                        (typeof iDOM.getAttribute('contentEditable') == 'string')  ||
                        iDOM.designMode
                    );
                }
            },
            ':list':       {
                feature:    $.makeSet('ul', 'ol', 'dl', 'datalist'),
                filter:     function () {
                    return  (arguments[0].tagName.toLowerCase() in this.feature);
                }
            },
            ':data':       {
                filter:    function () {
                    return  (! $.isEmptyObject(arguments[0].dataset));
                }
            },
            ':visible':    {
                feature:    {
                    display:    'none',
                    width:      0,
                    height:     0
                },
                filter:     function (iElement) {
                    var iStyle = _DOM_.operate('Style', [iElement], [
                            'display', 'width', 'height'
                        ]);

                    for (var iKey in iStyle)
                        if (iStyle[iKey] === this.feature[iKey])
                            return;
                    return true;
                }
            },
            ':parent':      {
                filter:    function () {
                    var iNode = arguments[0].childNodes;

                    if (! arguments[0].children.length) {
                        for (var i = 0;  i < iNode.length;  i++)
                            if (iNode[i].nodeType == 3)
                                return true;
                    } else  return true;
                }
            }
        };
    $.extend(iPseudo, {
        ':hidden':    {
            filter:    function () {
                return  (! iPseudo[':visible'].filter(arguments[0]));
            }
        },
        ':empty':     {
            filter:    function () {
                return  (! iPseudo[':parent'].filter(arguments[0]));
            }
        }
    });

    for (var _Pseudo_ in iPseudo)
        iPseudo[_Pseudo_].regexp = RegExp(
            '(.*?)' + _Pseudo_ + "([>\\+~\\s]*.*)"
        );

    function QuerySelector(iPath) {
        var iRoot = this;

        if ((this.nodeType == 9)  ||  (! this.parentNode))
            return iRoot.querySelectorAll(iPath);

        var _ID_ = this.getAttribute('id');

        if (! _ID_) {
            _ID_ = $.uuid('iQS');
            this.setAttribute('id', _ID_);
        }
        iPath = '#' + _ID_ + ' ' + iPath;
        iRoot = this.parentNode;

        iPath = iRoot.querySelectorAll(iPath);

        if (_ID_.slice(0, 3)  ==  'iQS')  this.removeAttribute('id');

        return iPath;
    }

    function DOM_Search(iRoot, iSelector) {
        var _Self_ = arguments.callee;

        return  $.map(iSelector.split(/\s*,\s*/),  function () {
            try {
                return $.makeArray(
                    QuerySelector.call(iRoot,  arguments[0] || '*')
                );
            } catch (iError) {
                var _Selector_;
                for (var _Pseudo_ in iPseudo) {
                    _Selector_ = arguments[0].match(iPseudo[_Pseudo_].regexp);
                    if (_Selector_)  break;
                };
                if (! _Selector_)  return;

                _Selector_[1] = _Selector_[1] || '*';
                _Selector_[1] += (_Selector_[1].match(/[\s>\+~]\s*$/) ? '*' : '');

                return $.map(
                    QuerySelector.call(iRoot, _Selector_[1]),
                    function (iDOM) {
                        if ( iPseudo[_Pseudo_].filter(iDOM) )
                            return  _Selector_[2]  ?
                                _Self_(iDOM,  '*' + _Selector_[2])  :  iDOM;
                    }
                );
            }
        });
    }
    var DOM_Sort = $.browser.msie ?
            function (iSet) {
                var $_Temp = [ ],  $_Result = [ ];

                for (var i = 0;  i < iSet.length;  i++) {
                    $_Temp[i] = new String(iSet[i].sourceIndex + 1e8);
                    $_Temp[i].DOM = iSet[i];
                }
                $_Temp.sort();

                for (var i = 0, j = 0;  i < $_Temp.length;  i++)
                    if ((! i)  ||  (
                        $_Temp[i].valueOf() != $_Temp[i - 1].valueOf()
                    ) || (
                        $_Temp[i].DOM.outerHTML  !=  $_Temp[i - 1].DOM.outerHTML
                    ))
                        $_Result[j++] = $_Temp[i].DOM;

                return $_Result;
            } :
            function (iSet) {
                iSet.sort(function (A, B) {
                    return  (A.compareDocumentPosition(B) & 2) - 1;
                });

                var $_Result = [ ];

                for (var i = 0, j = 0;  i < iSet.length;  i++) {
                    if (i  &&  (iSet[i] === iSet[i - 1]))  continue;

                    $_Result[j++] = iSet[i];
                }

                return $_Result;
            };

/* ---------- jQuery API ---------- */

    function iQuery(Element_Set, iContext) {
        /* ----- Global Wrapper ----- */
        var _Self_ = arguments.callee;

        if (! (this instanceof _Self_))
            return  new _Self_(Element_Set, iContext);
        if (Element_Set instanceof _Self_)
            return  Element_Set;

        /* ----- Constructor ----- */
        this.length = 0;

        if (! Element_Set) return;

        var iType = $.Type(Element_Set);

        if (iType == 'String') {
            Element_Set = Element_Set.trim();

            if (Element_Set[0] != '<') {
                this.context = iContext || DOM;
                this.selector = Element_Set;
                Element_Set = DOM_Search(this.context, Element_Set);
                Element_Set = (Element_Set.length < 2)  ?
                    Element_Set  :  DOM_Sort(Element_Set);
            } else {
                Element_Set = $.map(_Self_.parseHTML(Element_Set),  function () {
                    if (arguments[0].nodeType == 1)  return arguments[0];
                });
                if ((Element_Set.length == 1)  &&  $.isPlainObject( iContext ))
                    for (var iKey in iContext) {
                        if (typeof this[iKey] == 'function')
                            (new _Self_( Element_Set[0] ))[iKey]( iContext[iKey] );
                        else
                            (new _Self_( Element_Set[0] )).attr(iKey, iContext[iKey]);
                    }
            }
        } else if (iType in _DOM_.TypeMap.element)
            Element_Set = [ Element_Set ];

        if (! $.likeArray(Element_Set))
            return;

        $.extend(this, Element_Set, {
            length:     Element_Set.length,
            context:    (Element_Set.length == 1)  ?
                Element_Set[0].ownerDocument  :  this.context
        });
    }

    /* ----- iQuery Static Method ----- */

    var TagWrapper = $.extend(
            {
                area:      {before: '<map>'},
                legend:    {before: '<fieldset>'},
                param:     {before: '<object>'}
            },
            $.makeSet(['caption', 'thead', 'tbody', 'tfoot', 'tr'],  {
                before:    '<table>',
                after:     '</table>',
                depth:     2
            }),
            $.makeSet(['th', 'td'],  {
                before:    '<table><tr>',
                depth:     3
            }),
            $.makeSet(['optgroup', 'option'],  {before: '<select multiple>'})
        );

    $ = BOM.iQuery = $.extend(iQuery, $, {
        parseHTML:        function (iHTML, AttrList) {
            var iTag = iHTML.match(
                    /^\s*<([^\s\/\>]+)\s*([^<]*?)\s*(\/?)>([^<]*)((<\/\1>)?)([\s\S]*)/
                ) || [ ];

            if (iTag[5] === undefined)  iTag[5] = '';

            if (
                (iTag[5]  &&  (! (iTag.slice(2, 5).join('') + iTag[6])))  ||
                (iTag[3]  &&  (! (iTag[2] + iTag.slice(4).join(''))))
            )
                return  [DOM.createElement( iTag[1] )];

            var iWrapper = TagWrapper[ iTag[1] ],
                iNew = DOM.createElement('div');

            if (! iWrapper)
                iNew.innerHTML = iHTML;
            else {
                iNew.innerHTML =
                    iWrapper.before  +  iHTML  +  (iWrapper.after || '');
                iNew = $.trace(iNew,  'firstChild',  iWrapper.depth || 1)
                    .slice(-1)[0];
            }

            return $.map(
                $.makeArray(iNew.childNodes),
                function (iDOM, _Index_) {
                    return iDOM.parentNode.removeChild(iDOM);
                }
            );
        },
        buildFragment:    function (iNode) {
            var iFragment = DOM.createDocumentFragment();

            for (var i = 0;  iNode[i];  i++)
                iFragment.appendChild( iNode[i] );

            return iFragment;
        },
        data:             function (iElement, iName, iValue) {
            return  _DOM_.operate('Data', [iElement], iName, iValue);
        }
    });

    /* ----- iQuery Instance Method ----- */

    $.fn = $.prototype;
    $.fn.extend = $.extend;

    $.fn.extend({
        splice:             Array.prototype.splice,
        jquery:             '1.9.1',
        iquery:             2.0,
        pushStack:          function ($_New) {
            $_New = $(DOM_Sort(
                ($_New instanceof Array)  ?  $_New  :  $.makeArray($_New)
            ));
            $_New.prevObject = this;

            return $_New;
        },
        attr:               function () {
            return  _DOM_.operate('Attribute', this, arguments[0], arguments[1]);
        },
        prop:               function () {
            return  _DOM_.operate('Property', this, arguments[0], arguments[1]);
        },
        data:               function () {
            return  _DOM_.operate('Data', this, arguments[0], arguments[1]);
        },
        css:                function () {
            return  _DOM_.operate('Style', this, arguments[0], arguments[1]);
        },
        index:              function (iTarget) {
            if (! iTarget)
                return  $.trace(this[0], 'previousElementSibling').length;

            var iType = $.Type(iTarget);

            switch (true) {
                case (iType == 'String'):
                    return  $.inArray(this[0], $(iTarget));
                case ($.likeArray( iTarget )):
                    if (! (iType in _DOM_.TypeMap.element)) {
                        iTarget = iTarget[0];
                        iType = $.Type(iTarget);
                    }
                case (iType in _DOM_.TypeMap.element):
                    return  $.inArray(iTarget, this);
            }
            return -1;
        }
    });

    return $;

});
