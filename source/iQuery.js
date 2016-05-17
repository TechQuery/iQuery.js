//
//                >>>  iQuery.js  <<<
//
//
//      [Version]    v1.0  (2016-05-17)  Stable
//
//      [Usage]      A Light-weight jQuery Compatible API
//                   with IE 8+ compatibility.
//
//
//          (C)2015-2016    shiy2008@gmail.com
//


define([
    'extension/iObject', 'iObject', 'extension/iTimer', 'iCore', 'extension/iUtility',
    'iEvent', 'extension/iEvent', 'IE-8',
    'extension/iDOM', 'extension/iCSSRule', 'extension/iSelection',
    'iAnimation', 'iAJAX',
    'extension/HTML-5', 'extension/HTML-5_Form'
],  function ($) {

    var BOM = self;

    if (typeof BOM.jQuery != 'function')  BOM.$ = BOM.jQuery = $;

    return $;

});