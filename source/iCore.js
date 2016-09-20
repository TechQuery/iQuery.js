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
                Element_Set = $.find(Element_Set, this.context);
                Element_Set = (Element_Set.length < 2)  ?
                    Element_Set  :  $.uniqueSort(Element_Set);
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
                (Element_Set[0] || '').ownerDocument  :  this.context
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
        parseHTML:    function (iHTML, AttrList) {
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
                function (iDOM) {
                    return iDOM.parentNode.removeChild(iDOM);
                }
            );
        },
        data:         function (iElement, iName, iValue) {
            return  _DOM_.operate('Data', [iElement], iName, iValue);
        }
    });

    if (typeof BOM.jQuery != 'function')  BOM.$ = BOM.jQuery = $;

    /* ----- iQuery Instance Method ----- */

    $.fn = $.prototype;
    $.fn.extend = $.extend;

    $.fn.extend({
        splice:             Array.prototype.splice,
        jquery:             '1.9.1',
        iquery:             2.0,
        pushStack:          function ($_New) {
            $_New = $($.uniqueSort(
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
