define(['../iQuery', '../utility/index', '../object/ext/base'],  function ($) {

/* ---------- DOM Data ---------- */

    var _DOM_ = { },  _Data_ = [ ],  Root_Type = $.makeSet('Document', 'Window');

    _DOM_.data = {
        set:       function (iName, iValue) {

            if (typeof this.dataIndex != 'number')
                this.dataIndex = _Data_.push({ }) - 1;

            if (typeof iName === 'string')
                return  _Data_[ this.dataIndex ][ iName ] = iValue;

            $.extend(true,  _Data_[ this.dataIndex ],  iName);

            return iName;
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
/* ---------- DOM Attribute ---------- */

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

/* ---------- DOM Property ---------- */

    _DOM_.prop = {
        get:    function (iName) {

            return  iName ? this[iName] : this;
        },
        set:    function (iName, iValue) {

            this[iName] = iValue;
        },
        clear:    function (iName) {

            delete  this[ iName ];
        }
    };

/* ---------- DOM Style ---------- */

    _DOM_.css = {
        get:    function (iName) {

            if ($.Type(this) in Root_Type)  return;

            var iStyle = self.getComputedStyle(this, null);

            if (iName && iStyle) {
                iStyle = iStyle.getPropertyValue( iName );

                if (! iStyle) {
                    if (iName in $.cssPX)
                        iStyle = 0;
                } else if (iStyle.indexOf(' ') == -1) {

                    var iNumber = parseFloat( iStyle );

                    iStyle = isNaN(iNumber) ? iStyle : iNumber;
                }
            }

            return  (iStyle != null)  ?  iStyle  :  '';
        },
        set:    function (iName, iValue) {

            if ($.Type(this) in Root_Type)  return;

            if ($.isNumeric( iValue )  &&  (iName in $.cssPX))
                iValue += 'px';

            this.style.setProperty(iName, String(iValue), 'important');
        }
    };

/* ---------- Operator Wrapper ---------- */

    $.data = function (iElement, iName, iValue) {

        return  _DOM_.data[(arguments.length < 3) ? 'get' : 'set'].call(
            iElement,  iName,  iValue
        );
    };

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

                    if (key === 'data')  return  method.set.call(this, object);

                    for (var name in object)
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

        if ( method.clear )
            $.fn[$.camelCase('remove-' + key)] = function (name) {

                name = (name || '').valueOf();

                name = (typeof name === 'string')  ?  name.split(/\s+/)  :  name;

                return  this.each(function () {

                    for (var i = 0;  name[i];  i++)
                        method.clear.call(this, name[i]);
                });
            };
    });
});
