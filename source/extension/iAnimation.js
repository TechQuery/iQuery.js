define(['jquery'],  function ($) {

    $.fn.toggleAnimate = function (iClass, iData) {

        var CSS_Rule = BOM.getMatchedCSSRules(
                this.toggleClass( iClass ).children()[0]
            ) || '',
            $_This = this;

        for (var i = 0;  CSS_Rule[i];  i++)
            if (CSS_Rule[i].cssText.indexOf('transition') > 0)
                return  new Promise(function () {
                    $_This.one(
                        'transitionend webkitTransitionEnd',
                        (iData != null)  ?
                            $.proxy(arguments[0], null, iData)  :  arguments[0]
                    );
                });

        return  Promise.resolve( iData );
    };

});