//
//                >>>  iQuery.js  <<<
//
//
//      [Version]    v1.0  (2016-05-16)  Stable
//
//      [Usage]      A Light-weight jQuery Compatible API
//                   with IE 8+ compatibility.
//
//
//          (C)2015-2016    shiy2008@gmail.com
//


define([
    'iCore', 'iEvent',
    'IE-8',
    'iAnimation', 'iAJAX',
    'HTML-5', 'HTML-5_Form'
],  function ($) {

    var BOM = self;

    if (typeof BOM.jQuery != 'function')  BOM.$ = BOM.jQuery = $;

    return $;

});