define(['iCore'],  function ($) {

    var BOM = self,  DOM = self.document;

/* ---------- DOM Info Operator ---------- */

    var _DOM_ = { },  _Data_ = [ ],  Root_Type = $.makeSet('Document', 'Window');

    /* ----- DOM Data ----- */

    _DOM_.data = {
        set:       function (iName, iValue) {

            if (typeof this.dataIndex != 'number')
                this.dataIndex = _Data_.push({ }) - 1;

            _Data_[ this.dataIndex ][ iName ] = iValue;
        },
        get:       function (iName) {

            var iData = _Data_[this.dataIndex] || this.dataset;

            if (iName) {
                iData = iData || { };
                iData = iData[iName]  ||  iData[$.camelCase( iName )];

                if (typeof iData == 'string')  try {

                    iData = $.parseJSON( iData );

                } catch (iError) { }
            }

            return  ((iData instanceof Array)  ||  $.isPlainObject(iData))  ?
                    $.extend(true, null, iData)  :  iData;
        },
        clear:     function (iName) {

            if (Number.isInteger( this.dataIndex ))
                if (iName)
                    delete _Data_[this.dataIndex][iName];
                else {
                    delete _Data_[this.dataIndex];
                    delete this.dataIndex;
                }
        }
    };

    /* ----- DOM Attribute ----- */

    _DOM_.attr = {
        get:      function (iName) {

            if ($.Type(this) in Root_Type)  return;

            if (! iName)  return this.attributes;

            var iValue = this.getAttribute( iName );

            if (iValue !== null)  return iValue;
        },
        set:      function (iName, iValue) {
            if (
                (! ($.Type(this) in Root_Type))  &&
                (iValue !== undefined)
            )
                this.setAttribute(iName, iValue);
        },
        clear:    function (iName) {

            this.removeAttribute( iName );
        }
    };

    /* ----- DOM Property ----- */

    _DOM_.prop = {
        get:    function (iName) {

            return  iName ? this[iName] : this;
        },
        set:    function (iName, iValue) {

            this[iName] = iValue;
        }
    };

    /* ----- DOM Style ----- */

    _DOM_.css = {
        get:    function (iName) {

            if ($.Type(this) in Root_Type)  return;

            var iStyle = BOM.getComputedStyle(this, null);

            if (iName && iStyle) {
                iStyle = iStyle.getPropertyValue( iName );

                if (! iStyle) {
                    if (iName.match( $.cssPX ))
                        iStyle = 0;
                } else if (iStyle.indexOf(' ') == -1) {

                    var iNumber = parseFloat( iStyle );

                    iStyle = isNaN(iNumber) ? iStyle : iNumber;
                }
            }

            return  $.isData(iStyle) ? iStyle : '';
        },
        set:    function (iName, iValue) {

            if ($.Type(this) in Root_Type)  return;

            if ($.isNumeric( iValue )  &&  iName.match( $.cssPX ))
                iValue += 'px';

            this.style.setProperty(iName, String(iValue), 'important');
        }
    };

    /* ----- Operator Wrapper ----- */

    $.each(_DOM_,  function (key, method) {

        $.fn[key] = function (name, value) {

            var object,  first = this[0];

        //  Set all

            if (arguments.length > 1) {

                object = { };  object[name] = value;

            } else if ($.isPlainObject( name ))
                object = name;

            if ( object )
                return  this.each(function (index) {

                    for (var name in object)
                        if (object[name] === null) {
                            if (typeof method.clear === 'function')
                                method.clear.call(this, name);
                        } else
                            method.set.apply(this, [
                                name,
                                (typeof object[name] != 'function')  ?
                                    object[ name ]  :
                                    object[ name ].apply(this, [
                                        index,  method.get.call(this, name)
                                    ])
                            ]);
                });

        //  Get first

            if (! (name instanceof Array))
                return  method.get.call(first, name);

            object = { };

            $.each(name,  function () {

                object[this] = method.get.call(first, this);
            });

            return object;
        };
    });

    $.extend({
        data:         function (iElement, iName, iValue) {

            if (arguments.length < 3)
                return  _DOM_.data.get.call(iElement, iName);

            _DOM_.data.set.call(iElement, iName, iValue);

            var _Value_ = { };  _Value_[iName] = iValue;

            return _Value_;
        }
    });

/* ---------- DOM CSS Class ---------- */

    $.fn.hasClass = function (iName) {

        return  Boolean($.map(this,  function () {

            if (arguments[0].classList.contains( iName ))  return 1;
        })[0]);
    };

    $.each(['add', 'remove', 'toggle'],  function (_, key) {

        $.fn[key + 'Class'] = function (CSS_Class, toggle) {

            CSS_Class = CSS_Class && CSS_Class.valueOf();

            switch (typeof CSS_Class) {
                case 'string':      CSS_Class = CSS_Class.trim().split(/\s+/);
                case 'function':    break;
                case 'boolean':     toggle = CSS_Class;    break;
                default:
                    if (key === 'remove')
                        CSS_Class = '';
                    else
                        return this;
            }

            return  this.each(function (index) {

                var list = this.classList;

                CSS_Class = CSS_Class || list.value;

                if (CSS_Class instanceof Function)
                    list[ key ](CSS_Class.call(this, index, list.value),  toggle);
                else
                    for (var i = 0;  CSS_Class[i];  i++)
                        list[ key ](CSS_Class[i], toggle);
            });
        };
    });
});