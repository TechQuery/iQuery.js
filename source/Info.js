define(['iCore'],  function ($) {

    var BOM = self,  DOM = self.document;

/* ---------- DOM Info Operator - Get first, Set all. ---------- */

    var _DOM_ = {
            TypeMap:          {
                Get_Name:    $.makeSet('string', 'array', 'undefined'),
                root:        $.makeSet('Document', 'Window')
            },
            operate:          function (iType, iElement, iName, iValue) {
                if (iValue === null) {
                    if (this[iType].clear)
                        for (var i = 0;  i < iElement.length;  i++)
                            this[iType].clear(iElement[i], iName);
                    return iElement;
                }
                if (
                    (iValue === undefined)  &&
                    ($.type(iName) in this.TypeMap.Get_Name)
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

    $.extend({
        data:         function (iElement, iName, iValue) {
            return  _DOM_.operate('Data', [iElement], iName, iValue);
        }
    });

    $.fn.extend({
        attr:           function () {
            return  _DOM_.operate('Attribute', this, arguments[0], arguments[1]);
        },
        prop:           function () {
            return  _DOM_.operate('Property', this, arguments[0], arguments[1]);
        },
        data:           function () {
            return  _DOM_.operate('Data', this, arguments[0], arguments[1]);
        },
        css:            function () {
            return  _DOM_.operate('Style', this, arguments[0], arguments[1]);
        },
        addClass:       function (new_Class) {
            if (typeof new_Class != 'string')  return this;

            new_Class = new_Class.trim().split(/\s+/);

            return  this.attr('class',  function (_Index_, old_Class) {
                old_Class = (old_Class || '').trim().split(/\s+/);

                for (var i = 0, j = old_Class.length;  i < new_Class.length;  i++)
                    if ($.inArray(new_Class[i], old_Class) == -1)
                        old_Class[j++] = new_Class[i];

                return  old_Class.join(' ').trim();
            });
        },
        removeClass:    function (iClass) {
            if (typeof iClass != 'string')  return this;

            iClass = iClass.trim().split(/\s+/);

            return  this.attr('class',  function (_Index_, old_Class) {
                old_Class = (old_Class || '').trim().split(/\s+/);
                if (! old_Class[0])  return;

                var new_Class = [ ];

                for (var i = 0, j = 0;  i < old_Class.length;  i++)
                    if ($.inArray(old_Class[i], iClass) == -1)
                        new_Class[j++] = old_Class[i];

                return  new_Class.join(' ');
            });
        },
        hasClass:       function (iName) {
            return  (!!  $.map(this,  function () {
                return arguments[0].classList.contains(iName);
            })[0]);
        }
    });

});