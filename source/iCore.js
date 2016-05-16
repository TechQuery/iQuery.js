define(['ES-5'],  function () {

    var BOM = self,  DOM = self.document;

/* ---------- UA Check ---------- */
    var UA = navigator.userAgent;

    var is_Trident = UA.match(/MSIE (\d+)|Trident[^\)]+rv:(\d+)/i),
        is_Gecko = UA.match(/; rv:(\d+)[^\/]+Gecko\/\d+/),
        is_Webkit = UA.match(/AppleWebkit\/(\d+\.\d+)/i);
    var IE_Ver = is_Trident ? Number(is_Trident[1] || is_Trident[2]) : NaN,
        FF_Ver = is_Gecko ? Number(is_Gecko[1]) : NaN,
        WK_Ver = is_Webkit ? parseFloat(is_Webkit[1]) : NaN;

    var is_Pad = UA.match(/Tablet|Pad|Book|Android 3/i),
        is_Phone = UA.match(/Phone|Touch|Android 2|Symbian/i);
    var is_Mobile = (
            is_Pad || is_Phone || UA.match(/Mobile/i)
        ) && (! UA.match(/ PC /));

    var is_iOS = UA.match(/(iTouch|iPhone|iPad|iWatch);[^\)]+CPU[^\)]+OS (\d+_\d+)/i),
        is_Android = UA.match(/(Android |Silk\/)(\d+\.\d+)/i);

    var _Browser_ = {
            msie:             IE_Ver,
            mozilla:          FF_Ver,
            webkit:           WK_Ver,
            modern:           !  (IE_Ver < 9),
            mobile:           !! is_Mobile,
            pad:              !! is_Pad,
            phone:            !! is_Phone,
            ios:              is_iOS  ?  parseFloat( is_iOS[2].replace('_', '.') )  :  NaN,
            android:          is_Android ? parseFloat(is_Android[2]) : NaN,
            versionNumber:    IE_Ver || FF_Ver || WK_Ver
        };


/* ---------- Object Base ---------- */
    var _Object_ = {
            isEmptyObject:    function () {
                for (var iKey in arguments[0])
                    return false;
                return true;
            },
            isPlainObject:    function (iValue) {
                return  iValue && (iValue.constructor === Object);
            },
            likeArray:        function (iObject) {
                if ((! iObject)  ||  (typeof iObject != 'object'))
                    return false;

                iObject = (typeof iObject.valueOf == 'function')  ?
                    iObject.valueOf() : iObject;

                return Boolean(
                    iObject  &&
                    (typeof iObject.length == 'number')  &&
                    (typeof iObject != 'string')
                );
            },
            each:             function (Arr_Obj, iEvery) {
                if (this.likeArray( Arr_Obj ))
                    for (var i = 0;  i < Arr_Obj.length;  i++)  try {
                        if (false  ===  iEvery.call(Arr_Obj[i], i, Arr_Obj[i]))
                            break;
                    } catch (iError) {
                        console.dir( iError.valueOf() );
                    }
                else
                    for (var iKey in Arr_Obj)  try {
                        if (false === iEvery.call(
                            Arr_Obj[iKey],  iKey,  Arr_Obj[iKey]
                        ))
                            break;
                    } catch (iError) {
                        console.dir( iError.valueOf() );
                    }
                return Arr_Obj;
            },
            extend:           function () {
                var iDeep = (arguments[0] === true);
                var iTarget,
                    iFirst = iDeep ? 1 : 0;

                if (arguments.length  >  (iFirst + 1)) {
                    iTarget = arguments[iFirst] || (
                        (arguments[iFirst + 1] instanceof Array)  ?  [ ]  :  { }
                    );
                    iFirst++ ;
                } else
                    iTarget = this;

                for (var i = iFirst, iValue;  i < arguments.length;  i++)
                    for (var iKey in arguments[i])
                        if (
                            Object.prototype.hasOwnProperty.call(arguments[i], iKey)  &&
                            (arguments[i][iKey] !== undefined)
                        ) {
                            iTarget[iKey] = iValue = arguments[i][iKey];

                            if (iDeep)  try {
                                if ((iValue instanceof Array)  ||  _Object_.isPlainObject(iValue))
                                    iTarget[iKey] = arguments.callee.call(
                                        this,  true,  undefined,  iValue
                                    );
                            } catch (iError) { }
                        }
                return iTarget;
            },
            map:              function (iSource, iCallback) {
                var iTarget = { },  iArray;

                if (this.likeArray( iSource )) {
                    iTarget = [ ];
                    iArray = true;
                }

                if (typeof iCallback == 'function')
                    this.each(iSource,  function (iKey) {
                        if (this === undefined)  return;

                        var _Element_ = iCallback(arguments[1], iKey, iSource);

                        if ((_Element_ !== undefined)  &&  (_Element_ !== null))
                            if (iArray)
                                iTarget = iTarget.concat(_Element_);
                            else
                                iTarget[iKey] = _Element_;
                    });

                return iTarget;
            },
            makeArray:        _Browser_.modern ?
                function () {
                    return  Array.apply(null, arguments[0]);
                } :
                function () {
                    return  this.extend([ ], arguments[0]);
                },
            inArray:          function () {
                return  Array.prototype.indexOf.call(arguments[1], arguments[0]);
            },
            merge:            function (iSource) {
                if (! (iSource instanceof Array))
                    iSource = this.makeArray(iSource);

                for (var i = 1;  i < arguments.length;  i++)
                    iSource = Array.prototype.concat.apply(
                        iSource,
                        this.likeArray( arguments[i] )  ?
                            (
                                _Browser_.modern ?
                                    arguments[i] : this.makeArray(arguments[i])
                            )  :
                            [arguments[i]]
                    );
                return iSource;
            },
            unique:           function (iArray) {
                var iResult = [ ];

                for (var i = iArray.length - 1, j = 0;  i > -1 ;  i--)
                    if (this.inArray(iArray[i], iArray) == i)
                        iResult[j++] = iArray[i];

                return iResult.reverse();
            },
            isEqual:          function (iLeft, iRight) {
                if (!  (iLeft && iRight))
                    return  (iLeft == iRight);

                iLeft = iLeft.valueOf();
                iRight = iRight.valueOf();

                if (iLeft == iRight)  return true;
                if (! (
                    (iLeft instanceof Object)  &&  (iRight instanceof Object)
                ))
                    return false;

                var Left_Key = Object.getOwnPropertyNames(iLeft),
                    Right_Key = Object.getOwnPropertyNames(iRight);

                if (Left_Key.length != Right_Key.length)  return false;

                for (var i = 0, _Key_;  i < Left_Key.length;  i++) {
                    _Key_ = Left_Key[i];

                    if (! (
                        (_Key_ in iRight)  &&
                        arguments.callee.call(this, iLeft[_Key_], iRight[_Key_])
                    ))
                        return false;
                }
                return true;
            },
            makeSet:          function () {
                var iArgs = arguments,  iValue = true,  iSet = { };

                if (this.likeArray( iArgs[1] )) {
                    iValue = iArgs[0];
                    iArgs = iArgs[1];
                } else if (this.likeArray( iArgs[0] )) {
                    iValue = iArgs[1];
                    iArgs = iArgs[0];
                }

                for (var i = 0;  i < iArgs.length;  i++)
                    iSet[ iArgs[i] ] = (typeof iValue == 'function')  ?
                        iValue() : iValue;

                return iSet;
            },
            trace:            function (iObject, iName, iCount, iCallback) {
                if (typeof iCount == 'function')  iCallback = iCount;
                iCount = parseInt(iCount);
                iCount = isNaN(iCount) ? Infinity : iCount;

                var iResult = [ ];

                for (
                    var _Next_,  i = 0,  j = 0;
                    iObject[iName]  &&  (j < iCount);
                    iObject = _Next_,  i++
                ) {
                    _Next_ = iObject[iName];
                    if (
                        (typeof iCallback != 'function')  ||
                        (iCallback.call(_Next_, i, _Next_)  !==  false)
                    )
                        iResult[j++] = _Next_;
                }

                return iResult;
            },
            intersect:        function () {
                if (arguments.length < 2)  return arguments[0];

                var iArgs = this.makeArray( arguments );
                var iArray = this.likeArray( iArgs[0] );

                iArgs[0] = this.map(iArgs.shift(),  function (iValue, iKey) {
                    if ( iArray ) {
                        if (iArgs.indexOf.call(iArgs[0], iValue)  >  -1)
                            return iValue;
                    } else if (
                        (iArgs[0][iKey] !== undefined)  &&
                        (iArgs[0][iKey] === iValue)
                    )
                        return iValue;
                });

                return  arguments.callee.apply(this, iArgs);
            }
        };

    var Type_Info = {
            Data:         _Object_.makeSet('String', 'Number', 'Boolean'),
            BOM:          _Object_.makeSet('Window', 'DOMWindow', 'global'),
            DOM:          {
                set:        _Object_.makeSet(
                    'Array', 'HTMLCollection', 'NodeList', 'jQuery', 'iQuery'
                ),
                element:    _Object_.makeSet('Window', 'Document', 'HTMLElement'),
                root:       _Object_.makeSet('Document', 'Window')
            }
        };

    _Object_.type = function (iVar) {
        var iType = typeof iVar;

        try {
            iType = (iType == 'object') ? (
                (iVar && iVar.constructor.name) ||
                Object.prototype.toString.call(iVar).match(/\[object\s+([^\]]+)\]/i)[1]
            ) : (
                iType[0].toUpperCase() + iType.slice(1)
            );
        } catch (iError) {
            return 'Window';
        }

        if (! iVar)  switch (true) {
            case (isNaN(iVar)  &&  (iVar !== iVar)):    return 'NaN';
            case (iVar === null):                       return 'Null';
            default:                                    return iType;
        }

        if (
            Type_Info.BOM[iType] ||
            ((iVar == iVar.document) && (iVar.document != iVar))
        )
            return 'Window';

        if (iVar.location && (
            iVar.location  ===  (iVar.defaultView || { }).location
        ))
            return 'Document';

        if (
            iType.match(/HTML\w+?Element$/) ||
            (typeof iVar.tagName == 'string')
        )
            return 'HTMLElement';

        if ( this.likeArray(iVar) ) {
            iType = 'Array';
            if (! _Browser_.modern)  try {
                iVar.item();
                try {
                    iVar.namedItem();
                    return 'HTMLCollection';
                } catch (iError) {
                    return 'NodeList';
                }
            } catch (iError) { }
        }

        return iType;
    };

    _Object_.isData = function (iValue) {
        return  Boolean(iValue)  ||  (this.type(iValue) in Type_Info.Data);
    };

/* ---------- DOM Info Operator - Get first, Set all. ---------- */

    var _DOM_ = {
            Get_Name_Type:    _Object_.makeSet('String', 'Array', 'Undefined'),
            operate:          function (iType, iElement, iName, iValue) {
                if (iValue === null) {
                    if (this[iType].clear)
                        for (var i = 0;  i < iElement.length;  i++)
                            this[iType].clear(iElement[i], iName);
                    return iElement;
                }
                if (
                    (iValue === undefined)  &&
                    (_Object_.type(iName) in this.Get_Name_Type)
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
                var iResult;

                if (typeof iName == 'string') {
                    if (typeof iValue == 'function') {
                        for (var i = 0;  i < iElement.length;  i++)
                            iResult = this[iType].set(iElement[i], iName, iValue.call(
                                iElement[i],  i,  this[iType].get(iElement[i], iName)
                            ));
                        return  iResult || iElement;
                    } else {
                        iResult = { };
                        iResult[iName] = iValue;
                        iName = iResult;
                        iResult = undefined;
                    }
                }
                for (var i = 0;  i < iElement.length;  i++)
                    for (var iKey in iName)
                        iResult = this[iType].set(iElement[i], iKey, iName[iKey]);

                return  iResult || iElement;
            }
        };

    /* ----- DOM Attribute ----- */
    _DOM_.Attribute = {
        get:      function (iElement, iName) {
            if (_Object_.type(iElement) in Type_Info.DOM.root)  return;

            if (! iName)  return iElement.attributes;

            var iValue = iElement.getAttribute(iName);
            if (iValue !== null)  return iValue;
        },
        set:      function (iElement, iName, iValue) {
            return  (_Object_.type(iElement) in Type_Info.DOM.root) ?
                    false  :  iElement.setAttribute(iName, iValue);
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
    var Code_Indent = _Browser_.modern ? '' : ' '.repeat(4);

    _DOM_.Style = {
        PX_Needed:
            RegExp([
                'width', 'height', 'margin', 'padding',
                'top', 'right', 'bottom',  'left',
                'border-radius'
            ].join('|')),
        get:           function (iElement, iName) {
            if ((! iElement)  ||  (_Object_.type(iElement) in Type_Info.DOM.root))
                return;

            var iStyle = DOM.defaultView.getComputedStyle(iElement, null);

            if (iName && iStyle) {
                iStyle = iStyle.getPropertyValue(iName);

                if (! iStyle) {
                    if (iName.match( this.PX_Needed ))
                        iStyle = 0;
                } else if (iStyle.indexOf(' ') == -1) {
                    var iNumber = parseFloat(iStyle);
                    iStyle = isNaN(iNumber) ? iStyle : iNumber;
                }
            }
            return  _Object_.isData(iStyle) ? iStyle : '';
        },
        Set_Method:    _Browser_.modern ? 'setProperty' : 'setAttribute',
        set:           function (iElement, iName, iValue) {
            if (_Object_.type(iElement) in Type_Info.DOM.root)  return false;

            if ((! isNaN( Number(iValue) ))  &&  iName.match(this.PX_Needed))
                iValue += 'px';

            if (iElement)
                iElement.style[this.Set_Method](iName, String(iValue), 'important');
            else
                return  [iName, ':', Code_Indent, iValue].join('');
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
            if (typeof iElement.dataIndex != 'number')
                iElement.dataIndex = this._Data_.push({ }) - 1;

            var iData =  this._Data_[iElement.dataIndex] || iElement.dataset;

            if (iName) {
                iData = iData || { };
                iData = iData[iName]  ||  iData[ iName.toCamelCase() ];

                if (typeof iData == 'string')  try {
                    iData = BOM.JSON.parseAll(iData);
                } catch (iError) { }
            }

            return  ((iData instanceof Array)  ||  _Object_.isPlainObject(iData))  ?
                    _Object_.extend(true, undefined, iData)  :  iData;
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
    /* ----- DOM Content ----- */

    _DOM_.innerHTML = {
        set:    function (iElement, iHTML) {
            var IE_Scope = String(iHTML).match(
                    /^[^<]*<\s*(head|meta|title|link|style|script|noscript|(!--[^>]*--))[^>]*>/i
                );

            if (_Browser_.modern || (! IE_Scope))
                iElement.innerHTML = iHTML;
            else {
                iElement.innerHTML = 'IE_Scope' + iHTML;
                var iChild = iElement.childNodes;
                iChild[0].nodeValue = iChild[0].nodeValue.slice(8);
                if (! iChild[0].nodeValue.length)
                    iElement.removeChild(iChild[0]);
            }

            return _Object_.makeArray(iElement.childNodes);
        }
    };

/* ---------- DOM Event ---------- */
    _DOM_.operate('Data',  [BOM],  '_timer_',  { });

    var _Time_ = {
            _Root_:     BOM,
            now:        Date.now,
            every:      function (iSecond, iCallback) {
                var _BOM_ = this._Root_,
                    iTimeOut = (iSecond || 1) * 1000,
                    iTimer, iReturn, Index = 0,
                    iStart = this.now(), iDuring;

                iTimer = _BOM_.setTimeout(function () {
                    iDuring = (Date.now() - iStart) / 1000;
                    iReturn = iCallback.call(_BOM_, ++Index, iDuring);
                    if ((typeof iReturn == 'undefined') || iReturn)
                        _BOM_.setTimeout(arguments.callee, iTimeOut);
                }, iTimeOut);

                return iTimer;
            },
            wait:       function (iSecond, iCallback) {
                return  this.every(iSecond, function () {
                    iCallback.apply(this, arguments);
                    return false;
                });
            },
            start:      function (iName) {
                var _This_ = this,  Time_Stamp;

                _DOM_.operate('Data', [BOM], '_timer_',  function (_Index_, iTimer) {
                    iTimer = iTimer || { };
                    Time_Stamp = iTimer[iName] = _This_.now();
                    return iTimer;
                });

                return Time_Stamp;
            },
            end:        function () {
                var iTimer = _DOM_.operate('Data', [BOM], '_timer_');
                return  (this.now() - iTimer[arguments[0]]) / 1000;
            },
            uuid:       function () {
                return  [
                        (arguments[0] || 'uuid'),  '_',
                        this.now().toString(16),
                        Math.random().toString(16).slice(2)
                    ].join('');
            }
        };

/* ---------- DOM Constructor ---------- */
    function DOM_Create(TagName, AttrList) {
        var iNew,  iTag = TagName.match(/^\s*<(.+?)\s*\/?>([\s\S]+)?/);

        if (! iTag)  return  [ DOM.createTextNode(TagName) ];

        iNew = (iTag[2]  ||  (iTag[1].split(/\s/).length > 1))  ?
            _DOM_.innerHTML.set(
                DOM.createElement('div'),  TagName
            )  :  [
                DOM.createElement( iTag[1] )
            ];

        if ((iNew.length == 1)  &&  (iNew[0].nodeType == 1)  &&  AttrList)
            _Object_.each(AttrList,  function (iKey, iValue) {
                switch (iKey) {
                    case 'text':     return  iNew[0].textContent = iValue;
                    case 'html':     return  _DOM_.innerHTML.set(iNew[0], iValue);
                    case 'style':    {
                        if ( _Object_.isPlainObject(iValue) )
                            return  _DOM_.operate('Style', iNew, iValue);
                    }
                }
                _DOM_.operate('Attribute', iNew, iKey, iValue);
            });

        return  iNew[0].parentNode ?
            _Object_.map(iNew,  function (iDOM, _Index_) {
                if (iDOM.nodeType == 1) {
                    iNew[_Index_].parentNode.removeChild(iDOM);
                    return iDOM;
                }
            }) : iNew;
    }


/* ---------- DOM Selector ---------- */
    var iPseudo = {
            ':header':     {
                filter:    function () {
                    return  (arguments[0] instanceof HTMLHeadingElement);
                }
            },
            ':image':      {
                feature:    _Object_.extend(_Object_.makeSet(
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
                feature:    _Object_.makeSet(
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
                feature:    _Object_.makeSet(
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
                feature:    _Object_.makeSet('ul', 'ol', 'dl', 'datalist'),
                filter:     function () {
                    return  (arguments[0].tagName.toLowerCase() in this.feature);
                }
            },
            ':data':       {
                filter:    function () {
                    return  (! _Object_.isEmptyObject(arguments[0].dataset));
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
    _Object_.extend(iPseudo, {
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
            _ID_ = _Time_.uuid('iQS');
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

        return  _Object_.map(iSelector.split(/\s*,\s*/),  function () {
            try {
                return _Object_.makeArray(
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

                return _Object_.map(
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
    var DOM_Sort = _Browser_.msie ?
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

        var iType = _Object_.type(Element_Set);

        if (iType == 'String') {
            Element_Set = Element_Set.trim();

            if (Element_Set[0] != '<') {
                this.context = iContext || DOM;
                this.selector = Element_Set;
                Element_Set = DOM_Search(this.context, Element_Set);
                Element_Set = (Element_Set.length < 2)  ?
                    Element_Set  :  DOM_Sort(Element_Set);
            } else
                Element_Set = DOM_Create(
                    Element_Set,  _Object_.isPlainObject(iContext) && iContext
                );
        } else if (iType in Type_Info.DOM.element)
            Element_Set = [ Element_Set ];

        if (! _Object_.likeArray(Element_Set))
            return;

        _Object_.extend(this, Element_Set, {
            length:     Element_Set.length,
            context:    (Element_Set.length == 1)  ?
                Element_Set[0].ownerDocument  :  this.context
        });
    }

    var $ = BOM.iQuery = iQuery;


    /* ----- iQuery Static Method ----- */

    _Object_.extend($, _Object_, _Time_, {
        browser:          _Browser_,
        isSelector:       function () {
            try {
                DOM.querySelector(arguments[0])
            } catch (iError) {
                return false;
            }
            return true;
        },
        trim:             function () {
            return  arguments[0].trim();
        },
        split:            function (iString, iSplit, iLimit, iJoin) {
            iString = iString.split(iSplit);
            if (iLimit) {
                iString[iLimit - 1] = iString.slice(iLimit - 1).join(
                    (typeof iJoin == 'string') ? iJoin : iSplit
                );
                iString.length = iLimit;
            }
            return iString;
        },
        byteLength:       function () {
            return  arguments[0].replace(
                /[^\u0021-\u007e\uff61-\uffef]/g,  'xx'
            ).length;
        },
        parseJSON:        BOM.JSON.parseAll,
        parseXML:         function (iString) {
            iString = iString.trim();
            if ((iString[0] != '<') || (iString[iString.length - 1] != '>'))
                throw 'Illegal XML Format...';

            var iXML = (new BOM.DOMParser()).parseFromString(iString, 'text/xml');

            var iError = iXML.getElementsByTagName('parsererror');
            if (iError.length)
                throw  new SyntaxError(1, iError[0].childNodes[1].nodeValue);
            iXML.cookie;    //  for old WebKit core to throw Error

            return iXML;
        },
        globalEval:       function () {
            this('<script />').prop('text', arguments[0]).appendTo('head');
        },
        param:            function (iObject) {
            var iParameter = [ ],  iValue;

            if ( $.isPlainObject(iObject) )
                for (var iName in iObject) {
                    iValue = iObject[iName];

                    if ( $.isPlainObject(iValue) )
                        iValue = BOM.JSON.stringify(iValue);
                    else if (! $.isData(iValue))
                        continue;

                    iParameter.push(iName + '=' + BOM.encodeURIComponent(iValue));
                }
            else if ($.type(iObject) in Type_Info.DOM.set)
                for (var i = 0, j = 0;  i < iObject.length;  i++)
                    iParameter[j++] = iObject[i].name + '=' +
                        BOM.encodeURIComponent( iObject[i].value );

            return iParameter.join('&');
        },
        paramJSON:        function (Args_Str) {
            Args_Str = (
                Args_Str  ?  $.split(Args_Str, '?', 2)[1]  :  BOM.location.search
            ).match(/[^\?&\s]+/g);

            if (! Args_Str)  return { };

            var _Args_ = { };

            for (var i = 0, iValue;  i < Args_Str.length;  i++) {
                Args_Str[i] = $.split(Args_Str[i], '=', 2);

                iValue = BOM.decodeURIComponent( Args_Str[i][1] );
                try {
                    iValue = $.parseJSON(iValue);
                } catch (iError) { }

                _Args_[ Args_Str[i][0] ] = iValue;
            }

            return _Args_;
        },
        paramSign:        function (iData) {
            iData = (typeof iData == 'string')  ?  $.paramJSON(iData)  :  iData;

            return $.map(
                Object.getOwnPropertyNames(iData).sort(),
                function (iKey) {
                    switch (typeof iData[iKey]) {
                        case 'function':    return;
                        case 'object':      try {
                            return  iKey + '=' + JSON.stringify(iData[iKey]);
                        } catch (iError) { }
                    }
                    return  iKey + '=' + iData[iKey];
                }
            ).join(arguments[1] || '&');
        },
        fileName:         function () {
            return (
                arguments[0] || BOM.location.pathname
            ).match(/([^\?\#]+)(\?|\#)?/)[1].split('/').slice(-1)[0];
        },
        filePath:         function () {
            return (
                arguments[0] || BOM.location.href
            ).match(/([^\?\#]+)(\?|\#)?/)[1].split('/').slice(0, -1).join('/');
        },
        urlDomain:        function () {
            return ((
                arguments[0] || BOM.location.href
            ).match(/^(\w+:)?\/\/[^\/]+/) || [ ])[0];
        },
        data:             function (iElement, iName, iValue) {
            return  _DOM_.operate('Data', [iElement], iName, iValue);
        },
        contains:         function (iParent, iChild) {
            if (! iChild)  return false;

            if ($.browser.modern)
                return  !!(iParent.compareDocumentPosition(iChild) & 16);
            else
                return  (iParent !== iChild) && iParent.contains(iChild);
        },
        proxy:            function (iFunction, iContext) {
            var iArgs = $.makeArray(arguments).slice(2);

            return  function () {
                return  iFunction.apply(
                    iContext || this,  $.merge(iArgs, arguments)
                );
            };
        }
    });

    /* ----- iQuery Instance Method ----- */
    function DOM_Size(iName) {
        iName = {
            scroll:    'scroll' + iName,
            inner:     'inner' + iName,
            client:    'client' + iName,
            css:       iName.toLowerCase()
        };

        return  function () {
            if (! this[0])  return  arguments.length ? this : 0;

            switch ( $.type(this[0]) ) {
                case 'Document':
                    return  Math.max(
                        this[0].documentElement[iName.scroll],
                        this[0].body[iName.scroll]
                    );
                case 'Window':
                    return  this[0][iName.inner] || Math.max(
                        this[0].document.documentElement[iName.client],
                        this[0].document.body[iName.client]
                    );
            }
            var iValue = parseFloat(arguments[0]),
                iFix = this.is('table') ? 4 : 0;

            if (isNaN( iValue ))  return  this[0][iName.client] + iFix;

            for (var i = 0;  i < this.length;  i++)
                this[i].style[iName.css] = iValue - iFix;
            return this;
        };
    }

    function Scroll_DOM() {
        return (
            ($.browser.webkit || (
                (this.tagName || '').toLowerCase()  !=  'body'
            )) ?
            this : this.ownerDocument.documentElement
        );
    }

    function DOM_Scroll(iName) {
        iName = {
            scroll:    'scroll' + iName,
            offset:    (iName == 'Top') ? 'pageYOffset' : 'pageXOffset'
        };

        return  function (iPX) {
            iPX = parseInt(iPX);

            if ( isNaN(iPX) ) {
                iPX = Scroll_DOM.call(this[0])[iName.scroll];

                return  (iPX !== undefined) ? iPX : (
                    this[0].documentElement[iName.scroll] ||
                    this[0].defaultView[iName.offset] ||
                    this[0].body[iName.scroll]
                );
            }
            for (var i = 0;  i < this.length;  i++) {
                if (this[i][iName.scroll] !== undefined) {
                    Scroll_DOM.call(this[i])[iName.scroll] = iPX;
                    continue;
                }
                this[i].documentElement[iName.scroll] =
                    this[i].defaultView[iName.offset] =
                    this[i].body[iName.scroll] = iPX;
            }
        };
    }
    function DOM_Insert(iName) {
        return  function () {
            if (
                this.length &&
                (!  this.before.apply($(this[0][iName]), arguments).length)
            )
                this.append.apply(
                    (iName == 'firstElementChild')  ?  this  :  this.parent(),
                    arguments
                );

            return this;
        };
    }

    var Array_Reverse = Array.prototype.reverse,  DOM_Proto = Element.prototype;

    DOM_Proto.matches = DOM_Proto.matches || DOM_Proto.webkitMatchesSelector ||
        DOM_Proto.msMatchesSelector || DOM_Proto.mozMatchesSelector;

    $.fn = $.prototype;
    $.fn.extend = $.extend;

    $.fn.extend({
        splice:             Array.prototype.splice,
        jquery:             '1.9.1',
        iquery:             '1.0',
        pushStack:          function ($_New) {
            $_New = $(DOM_Sort(
                ($_New instanceof Array)  ?  $_New  :  $.makeArray($_New)
            ));
            $_New.prevObject = this;

            return $_New;
        },
        refresh:            function () {
            if (! this.selector)  return this;

            var $_New = $(this.selector, this.context);

            if (this.prevObject instanceof $)
                $_New = this.prevObject.pushStack($_New);

            return $_New;
        },
        add:                function () {
            return this.pushStack(
                $.merge(this,  $.apply(BOM, arguments))
            );
        },
        slice:              function () {
            return  this.pushStack( [ ].slice.apply(this, arguments) );
        },
        eq:                 function (Index) {
            return  this.pushStack(
                [ ].slice.call(this,  Index,  (Index + 1) || undefined)
            );
        },
        index:              function (iTarget) {
            if (! iTarget)
                return  $.trace(this[0], 'previousElementSibling').length;

            var iType = $.type(iTarget);
            switch (true) {
                case (iType == 'String'):
                    return  $.inArray(this[0], $(iTarget));
                case ((iType in Type_Info.DOM.set)  &&  (!! iTarget.length)):    {
                    iTarget = iTarget[0];
                    iType = $.type(iTarget);
                }
                case (iType in Type_Info.DOM.element):
                    return  $.inArray(iTarget, this);
            }
            return -1;
        },
        each:               function () {
            return  $.each(this, arguments[0]);
        },
        is:                 function ($_Match) {
            var iPath = (typeof $_Match == 'string'),
                iMatch = (typeof Element.prototype.matches == 'function');

            for (var i = 0, $_Is;  i < this.length;  i++) {
                if (this[i] === $_Match)  return true;

                if (iPath && iMatch)  try {
                    return this[i].matches($_Match);
                } catch (iError) { }

                if (! this[i].parentNode)  $('<div />')[0].appendChild( this[i] );

                $_Is = iPath  ?  $($_Match, this[i].parentNode)  :  $($_Match);

                return  ($_Is.index( this[i] )  >  -1);
            }

            return false;
        },
        filter:             function () {
            var $_Result = [ ];

            for (var i = 0, j = 0;  i < this.length;  i++)
                if ($( this[i] ).is( arguments[0] ))
                    $_Result[j++] = this[i];

            return this.pushStack($_Result);
        },
        not:                function () {
            var $_Result = [ ];

            for (var i = 0, j = 0;  i < this.length;  i++)
                if (! $( this[i] ).is( arguments[0] ))
                    $_Result[j++] = this[i];

            return this.pushStack($_Result);
        },
        attr:               function () {
            return  _DOM_.operate('Attribute', this, arguments[0], arguments[1]);
        },
        removeAttr:         function (iAttr) {
            iAttr = iAttr.trim().split(/\s+/);

            for (var i = 0;  i < iAttr.length;  i++)
                this.attr(iAttr[i], null);

            return this;
        },
        prop:               function () {
            return  _DOM_.operate('Property', this, arguments[0], arguments[1]);
        },
        data:               function () {
            return  _DOM_.operate('Data', this, arguments[0], arguments[1]);
        },
        addBack:            function () {
            return  this.pushStack( $.merge(this, this.prevObject) );
        },
        parent:             function () {
            var $_Result = [ ];

            for (var i = 0, j = 0;  i < this.length;  i++)
                if ($.inArray(this[i].parentNode, $_Result) == -1)
                    $_Result[j++] = this[i].parentNode;

            return this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            );
        },
        parents:            function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $_Result.concat(
                    $.trace(this[i], 'parentNode').slice(0, -1)
                );

            return  Array_Reverse.call(this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            ));
        },
        sameParents:        function () {
            if (this.length < 2)  return this.parents();

            var iMin = $.trace(this[0], 'parentNode').slice(0, -1),
                iPrev;

            for (var i = 1, iLast;  i < this.length;  i++) {
                iLast = $.trace(this[i], 'parentNode').slice(0, -1);
                if (iLast.length < iMin.length) {
                    iPrev = iMin;
                    iMin = iLast;
                }
            }
            iPrev = iPrev || iLast;

            var iDiff = iPrev.length - iMin.length,  $_Result = [ ];

            for (var i = 0;  i < iMin.length;  i++)
                if (iMin[i]  ===  iPrev[i + iDiff]) {
                    $_Result = iMin.slice(i);
                    break;
                }
            return  Array_Reverse.call(this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            ));
        },
        parentsUntil:       function () {
            return  Array_Reverse.call(
                this.parents().not( $(arguments[0]).parents().addBack() )
            );
        },
        children:           function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $.merge($_Result, this[i].children);

            return this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            );
        },
        contents:           function () {
            var $_Result = [ ],
                Type_Filter = parseInt(arguments[0]);

            for (var i = 0;  i < this.length;  i++)
                $_Result = $.merge(
                    $_Result,
                    (this[i].tagName.toLowerCase() != 'iframe') ?
                        this[i].childNodes : this[i].contentWindow.document
                );
            if ($.type(Type_Filter) == 'Number')
                for (var i = 0;  i < $_Result.length;  i++)
                    if ($_Result[i].nodeType != Type_Filter)
                        $_Result[i] = null;

            return this.pushStack($_Result);
        },
        nextAll:            function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $_Result.concat(
                    $.trace(this[i], 'nextElementSibling')
                );

            return this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            );
        },
        prevAll:            function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $_Result.concat(
                    $.trace(this[i], 'previousElementSibling')
                );
            $_Result.reverse();

            return Array_Reverse.call(this.pushStack(
                arguments[0]  ?  $($_Result).filter(arguments[0])  :  $_Result
            ));
        },
        siblings:           function () {
            var $_Result = this.prevAll().add( this.nextAll() );

            return this.pushStack(
                arguments[0]  ?  $_Result.filter(arguments[0])  :  $_Result
            );
        },
        find:               function () {
            var $_Result = [ ];

            for (var i = 0;  i < this.length;  i++)
                $_Result = $.merge($_Result,  $(arguments[0], this[i]));

            return  this.pushStack($_Result);
        },
        has:                function ($_Filter) {
            if (typeof $_Filter != 'string') {
                var _UUID_ = $.uuid('Has');
                $($_Filter).addClass(_UUID_);
                $_Filter = '.' + _UUID_;
            }

            return  this.pushStack($.map(this,  function () {
                if ( $($_Filter, arguments[0]).removeClass(_UUID_).length )
                    return arguments[0];
            }));
        },
        detach:             function () {
            for (var i = 0;  i < this.length;  i++)
                if (this[i].parentNode)
                    this[i].parentNode.removeChild(this[i]);

            return this;
        },
        remove:             function () {
            return this.detach();
        },
        empty:              function () {
            this.children().remove();

            for (var i = 0, iChild;  i < this.length;  i++) {
                iChild = this[i].childNodes;
                for (var j = 0;  j < iChild.length;  j++)
                    this[i].removeChild(iChild[j]);
            }

            return this;
        },
        text:               function (iText) {
            var iGetter = (! $.isData(iText)),  iResult = [ ];

            if (! iGetter)  this.empty();

            for (var i = 0, j = 0;  i < this.length;  i++)
                if (iGetter)
                    iResult[j++] = this[i].textContent;
                else
                    this[i].textContent = iText;

            return  iResult.length ? iResult.join('') : this;
        },
        html:               function (iHTML) {
            if (! $.isData(iHTML))
                return this[0].innerHTML;

            this.empty();

            for (var i = 0;  i < this.length;  i++)
                _DOM_.innerHTML.set(this[i], iHTML);

            return  this;
        },
        css:                function () {
            return  _DOM_.operate('Style', this, arguments[0], arguments[1]);
        },
        width:              DOM_Size('Width'),
        height:             DOM_Size('Height'),
        scrollParents:      function () {
            return  Array_Reverse.call(this.pushStack(
                $.map(this.parents(),  function () {
                    var $_This = $(arguments[0]);

                    if (
                        ($_This.height() < $_This[0].scrollHeight)  ||
                        ($_This.width() < $_This[0].scrollWidth)
                    )
                        return $_This[0];
                })
            ));
        },
        scrollTop:          DOM_Scroll('Top'),
        scrollLeft:         DOM_Scroll('Left'),
        position:           function () {
            return  {
                left:    this[0].offsetLeft,
                top:     this[0].offsetTop
            };
        },
        offset:             function (iCoordinate) {
            if ( $.isPlainObject(iCoordinate) )
                return this.css($.extend({
                    position:    'fixed'
                }, iCoordinate));

            var _DOM_ = (this[0] || { }).ownerDocument;
            var _Body_ = _DOM_  &&  $('body', _DOM_)[0];

            if (!  (_DOM_  &&  _Body_  &&  $.contains(_Body_, this[0])))
                return  {left: 0,  top: 0};

            var $_DOM_ = $(_DOM_),  iBCR = this[0].getBoundingClientRect();

            return {
                left:    parseFloat(
                    ($_DOM_.scrollLeft() + iBCR.left).toFixed(4)
                ),
                top:     parseFloat(
                    ($_DOM_.scrollTop() + iBCR.top).toFixed(4)
                )
            };
        },
        addClass:           function (new_Class) {
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
        removeClass:        function (iClass) {
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
        hasClass:           function () {
            try {
                return this[0].classList.contains(arguments[0]);
            } catch (iError) {
                return false;
            }
        },
        append:             function () {
            var $_Child = $(arguments[0], arguments[1]),
                DOM_Cache = DOM.createDocumentFragment();

            return  this.each(function (Index) {
                    var _Child_ = Index ? $_Child.clone(true) : $_Child,
                        _Cache_ = DOM_Cache.cloneNode();

                    for (var i = 0;  i < _Child_.length;  i++)
                        _Cache_.appendChild( _Child_[i] );

                    this.appendChild(_Cache_);
                });
        },
        appendTo:           function () {
            $(arguments[0], arguments[1]).append(this);

            return  this;
        },
        before:             function () {
            var $_Brother = $(arguments[0], arguments[1]),
                DOM_Cache = DOM.createDocumentFragment();

            return  this.each(function (Index) {
                var _Brother_ = Index ? $_Brother.clone(true) : $_Brother,
                    _Cache_ = DOM_Cache.cloneNode();

                for (var i = 0;  i < _Brother_.length;  i++)
                    if (_Brother_[i] !== this)
                        _Cache_.appendChild(_Brother_[i]);

                this.parentNode.insertBefore(_Cache_, this);
            });
        },
        prepend:            DOM_Insert('firstElementChild'),
        prependTo:          function () {
            $(arguments[0], arguments[1]).prepend(this);

            return  this;
        },
        after:              DOM_Insert('nextElementSibling'),
        val:                function () {
            if (! $.isData(arguments[0]))
                return  this[0] && this[0].value;
            else
                return  this.not('input[type="file"]').prop('value', arguments[0]);
        },
        serializeArray:     function () {
            var $_Value = this.find('*[name]:input').not(':button, [disabled]'),
                iValue = [ ];

            for (var i = 0, j = 0;  i < $_Value.length;  i++)
                if (
                    (! $_Value[i].type.match(/radio|checkbox/i))  ||
                    $_Value[i].checked
                )
                    iValue[j++] = $($_Value[i]).prop(['name', 'value']);

            return iValue;
        },
        serialize:          function () {
            return  $.param( this.serializeArray() );
        }
    });

/* ----- DOM Data Reduce  ----- */

    var iOperator = {
            '+':    function () {
                return  arguments[0] + arguments[1];
            },
            '-':    function () {
                return  arguments[0] - arguments[1];
            }
        };

    $.fn.reduce = function (iMethod, iKey, iCallback) {
        if (arguments.length < 3) {
            iCallback = iKey;
            iKey = undefined;
        }
        if (typeof iCallback == 'string')  iCallback = iOperator[iCallback];

        return  $.map(this,  function () {
            return  $( arguments[0] )[iMethod](iKey);
        }).reduce(iCallback);
    };

/* ----- DOM UI Data Operator ----- */

    var RE_URL = /^(\w+:)?\/\/[\u0021-\u007e\uff61-\uffef]+$/;

    function Value_Operator(iValue) {
        var $_This = $(this),
            End_Element = (! this.children.length);

        var _Set_ = $.isData(iValue),
            iURL = (typeof iValue == 'string')  &&  iValue.trim();
        var isURL = iURL && iURL.split('#')[0].match(RE_URL);

        switch ( this.tagName.toLowerCase() ) {
            case 'a':           {
                if (_Set_) {
                    if (isURL)  $_This.attr('href', iURL);
                    if (End_Element)  $_This.text(iValue);
                    return;
                }
                return  $_This.attr('href')  ||  (End_Element && $_This.text());
            }
            case 'img':         return  $_This.attr('src', iValue);
            case 'textarea':    ;
            case 'select':      return $_This.val(iValue);
            case 'option':      return $_This.text(iValue);
            case 'input':       {
                var _Value_ = this.value;

                if (this.getAttribute('type') != 'tel')  try {
                    _Value_ = JSON.parse(_Value_);
                } catch (iError) { }

                if ((this.type || '').match(/radio|checkbox/i)) {
                    if (_Set_) {
                        if ((! _Value_)  ||  (_Value_ == 'on'))
                            this.value = iValue;
                        else if (_Value_ === iValue)
                            this.checked = true;
                    } else
                        return  this.checked && _Value_;
                } else if (_Set_)
                    this.value = iValue;

                return _Value_;
            }
            default:            {
                if (_Set_) {
                    if ((! End_Element)  &&  isURL)
                        $_This.css('background-image',  'url("' + iURL + '")');
                    else
                        $_This.html(iValue);
                    return;
                }
                iURL = $_This.css('background-image')
                    .match(/^url\(('|")?([^'"]+)('|")?\)/);
                return  End_Element  ?  $_This.text()  :  (iURL && iURL[2]);
            }
        }
    }

    $.fn.value = function (iAttr, iFiller) {
        if (typeof iAttr == 'function') {
            iFiller = iAttr;
            iAttr = '';
        }
        var $_Value = iAttr  ?  this.filter('[' + iAttr + ']')  :  this;
        $_Value = $_Value.length  ?  $_Value  :  this.find('[' + iAttr + ']');

        if (! iFiller)  return Value_Operator.call($_Value[0]);

        var Data_Set = (typeof iFiller != 'function');

        for (var i = 0, iKey;  i < $_Value.length;  i++) {
            iKey = iAttr && $_Value[i].getAttribute(iAttr);

            Value_Operator.call(
                $_Value[i],
                Data_Set  ?  iFiller[iKey]  :  iFiller.apply($_Value[i], [
                    iKey || Value_Operator.call($_Value[i]),  i,  $_Value
                ])
            );
        }
        return this;
    };

/* ---------- Smart zIndex ---------- */

    function Get_zIndex() {
        var $_This = $(this);

        var _zIndex_ = $_This.css('z-index');
        if (_zIndex_ != 'auto')  return parseInt(_zIndex_);

        var $_Parents = $_This.parents();
        _zIndex_ = 0;

        $_Parents.each(function () {
            var _Index_ = $(this).css('z-index');

            _zIndex_ = _zIndex_ + (
                (_Index_ == 'auto')  ?  1  :  _Index_
            );
        });

        return ++_zIndex_;
    }

    function Set_zIndex() {
        var $_This = $(this),  _Index_ = 0;

        $_This.siblings().addBack().filter(':visible').each(function () {
            _Index_ = Math.max(_Index_, Get_zIndex.call(this));
        });
        $_This.css('z-index', ++_Index_);
    }

    $.fn.zIndex = function (new_Index) {
        if (! $.isData(new_Index))
            return  Get_zIndex.call(this[0]);
        else if (new_Index == '+')
            return  this.each(Set_zIndex);
        else
            return  this.css('z-index',  parseInt(new_Index) || 'auto');
    };

/* ---------- CSS Rule ---------- */

    function CSS_Rule2Text(iRule) {
        var Rule_Text = [''],  Rule_Block,  _Rule_Block_;

        $.each(iRule,  function (iSelector) {
            Rule_Block = iSelector + ' {';
            _Rule_Block_ = [ ];

            for (var iAttribute in this)
                _Rule_Block_.push(
                    _DOM_.operate('Style', [null], iAttribute, this[iAttribute])
                        .replace(/^(\w)/m,  Code_Indent + '$1')
                );

            Rule_Text.push(
                [Rule_Block, _Rule_Block_.join(";\n"), '}'].join("\n")
            );
        });
        Rule_Text.push('');

        return Rule_Text.join("\n");
    }

    $.cssRule = function (iMedia, iRule) {
        if (typeof iMedia != 'string') {
            iRule = iMedia;
            iMedia = null;
        }
        var CSS_Text = CSS_Rule2Text(iRule);

        var $_Style = $('<style />', {
                type:       'text/css',
                'class':    'iQuery_CSS-Rule',
                text:       (! iMedia) ? CSS_Text : [
                    '@media ' + iMedia + ' {',
                    CSS_Text.replace(/\n/m, "\n    "),
                    '}'
                ].join("\n")
            }).appendTo(DOM.head);

        return  ($_Style[0].sheet || $_Style[0].styleSheet);
    };

    function CSS_Rule_Search(iStyleSheet, iFilter) {
        return  $.map(iStyleSheet || DOM.styleSheets,  function () {
            var iRule = arguments[0].cssRules,  _Self_ = arguments.callee;
            if (! iRule)  return;

            return  $.map(iRule,  function (_Rule_) {
                return  (_Rule_.cssRules ? _Self_ : iFilter)(_Rule_);
            });
        });
    }

    function CSSRuleList() {
        $.extend(this, arguments[0]);
        this.length = arguments[0].length;
    }

    if (typeof BOM.getMatchedCSSRules != 'function')
        BOM.getMatchedCSSRules = function (iElement, iPseudo) {
            if (! (iElement instanceof Element))  return null;

            if (typeof iPseudo == 'string') {
                iPseudo = (iPseudo.match(/^\s*:{1,2}([\w\-]+)\s*$/) || [ ])[1];

                if (! iPseudo)  return null;
            } else if (iPseudo)
                iPseudo = null;

            return  new CSSRuleList(CSS_Rule_Search(null,  function (iRule) {
                var iSelector = iRule.selectorText;

                if (iPseudo) {
                    iSelector = iSelector.replace(/:{1,2}([\w\-]+)$/,  function () {
                        return  (arguments[1] == iPseudo)  ?  ''  :  arguments[0];
                    });
                    if (iSelector == iRule.selectorText)  return;
                }
                if (iElement.matches( iSelector ))  return iRule;
            }));
        };

    $.fn.cssRule = function (iRule, iCallback) {
        if (! $.isPlainObject(iRule)) {
            var $_This = this;

            return  ($_This[0]  &&  CSS_Rule_Search(null,  function (_Rule_) {
                if ((
                    (typeof $_This.selector != 'string')  ||
                    ($_This.selector != _Rule_.selectorText)
                ) &&
                    (! $_This[0].matches(_Rule_.selectorText))
                )
                    return;

                if ((! iRule)  ||  (iRule && _Rule_.style[iRule]))
                    return _Rule_;
            }));
        }
        return  this.each(function () {
            var _Rule_ = { },  _ID_ = this.getAttribute('id');

            if (! _ID_) {
                _ID_ = $.uuid();
                this.setAttribute('id', _ID_);
            }
            for (var iSelector in iRule)
                _Rule_['#' + _ID_ + iSelector] = iRule[iSelector];

            var iSheet = $.cssRule(_Rule_);

            if (typeof iCallback == 'function')  iCallback.call(this, iSheet);
        });
    };

/* ---------- Selection  Getter & Setter ---------- */

    var W3C_Selection = (! ($.browser.msie < 10));

    function Select_Node(iSelection) {
        var iFocus = W3C_Selection ?
                iSelection.focusNode : iSelection.createRange().parentElement();
        var iActive = iFocus.ownerDocument.activeElement;

        return  $.contains(iActive, iFocus)  ?  iFocus  :  iActive;
    }

    function Find_Selection() {
        var iDOM = this.document || this.ownerDocument || this;

        if (iDOM.activeElement.tagName.toLowerCase() == 'iframe')  try {
            return  arguments.callee.call( iDOM.activeElement.contentWindow );
        } catch (iError) { }

        var iSelection = W3C_Selection ? iDOM.getSelection() : iDOM.selection;
        var iNode = Select_Node(iSelection);

        return  $.contains(
            (this instanceof Element)  ?  this  :  iDOM,  iNode
        ) && [
            iSelection, iNode
        ];
    }

    $.fn.selection = function (iContent) {
        if (iContent === undefined) {
            var iSelection = Find_Selection.call(this[0])[0];

            return  W3C_Selection ?
                iSelection.toString() : iSelection.createRange().htmlText;
        }

        return  this.each(function () {
            var iSelection = Find_Selection.call(this);
            var iNode = iSelection[1];

            iSelection = iSelection[0];
            iNode = (iNode.nodeType == 1)  ?  iNode  :  iNode.parentNode;

            if (! W3C_Selection) {
                iSelection = iSelection.createRange();

                return  iSelection.text = (
                    (typeof iContent == 'function')  ?
                        iContent.call(iNode, iSelection.text)  :  iContent
                );
            }
            var iProperty, iStart, iEnd;

            if ((iNode.tagName || '').match(/input|textarea/i)) {
                iProperty = 'value';
                iStart = Math.min(iNode.selectionStart, iNode.selectionEnd);
                iEnd = Math.max(iNode.selectionStart, iNode.selectionEnd);
            } else {
                iProperty = 'innerHTML';
                iStart = Math.min(iSelection.anchorOffset, iSelection.focusOffset);
                iEnd = Math.max(iSelection.anchorOffset, iSelection.focusOffset);
            }

            var iValue = iNode[iProperty];

            iNode[iProperty] = iValue.slice(0, iStart)  +  (
                (typeof iContent == 'function')  ?
                    iContent.call(iNode, iValue.slice(iStart, iEnd))  :  iContent
            )  +  iValue.slice(iEnd);
        });
    };

    return $;

});