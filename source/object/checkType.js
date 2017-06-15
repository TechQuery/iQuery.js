define(['../polyfill/ES_API'],  function () {

    return {
        type:             function (iValue) {

            if (iValue === null)  return 'null';

            var iType = typeof (
                    (iValue && iValue.valueOf)  ?  iValue.valueOf()  :  iValue
                );
            return  (iType != 'object')  ?  iType  :
                Object.prototype.toString.call( iValue ).slice(8, -1).toLowerCase();
        },
        isNumeric:        function (iValue) {

            iValue = (iValue && iValue.valueOf)  ?  iValue.valueOf()  :  iValue;

            if ((iValue === '')  ||  (iValue === Infinity)  ||  isNaN(iValue))
                return false;

            switch (typeof iValue) {
                case 'string':    break;
                case 'number':    break;
                default:          return false;
            }

            return  (typeof +iValue == 'number');
        },
        isPlainObject:    function (iValue) {

            return  iValue  &&  (typeof iValue == 'object')  &&  (
                Object.getPrototypeOf( iValue )  ===  Object.prototype
            );
        },
        isEmptyObject:    function () {

            for (var iKey in arguments[0])  return false;

            return true;
        }
    };
});