//
//              >>>  jQuery+  <<<
//
//
//    [Version]    v7.1  (2016-05-17)
//
//    [Require]    jQuery  v1.9+
//
//
//        (C)2014-2016  shiy2008@gmail.com
//


define([
    'jquery',
    'extension/iBrowser', 'extension/iObject', 'extension/iTimer', 'extension/iUtility',
    'extension/iDOM', 'extension/iCSSRule', 'extension/iSelection', 'extension/iEvent',
    'extension/iAJAX', 'extension/HTML-5', 'extension/HTML-5_Form'
],  function ($) {

    var BOM = self;

    return  BOM.jQuery.extend(true, $);

});