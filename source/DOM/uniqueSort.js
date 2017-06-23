define(function () {

    return  ('sourceIndex' in Element.prototype)  ?
        function (iSet) {

            var $_Temp = [ ],  $_Result = [ ];

            for (var i = 0;  iSet[i];  i++) {

                $_Temp[i] = new String(iSet[i].sourceIndex + 1e8);

                $_Temp[i].DOM = iSet[i];
            }

            $_Temp.sort();

            for (var i = 0, j = 0;  $_Temp[i];  i++)
                if ((! i)  ||  (
                    $_Temp[i].valueOf() != $_Temp[i - 1].valueOf()
                ) || (
                    $_Temp[i].DOM.outerHTML  !=  $_Temp[i - 1].DOM.outerHTML
                ))
                    $_Result[j++] = $_Temp[i].DOM;

            return $_Result;
        }  :
        function (iSet) {

            iSet.sort(function (A, B) {

                return  (A.compareDocumentPosition( B )  &  2)  -  1;
            });

            var $_Result = [ ];

            for (var i = 0, j = 0;  iSet[i];  i++) {

                if (i  &&  (iSet[i] === iSet[i - 1]))  continue;

                $_Result[j++] = iSet[i];
            }

            return $_Result;
        };

});