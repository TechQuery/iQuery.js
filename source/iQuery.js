//
//                >>>  iQuery.js  <<<
//
//
//      [Version]    v2.0  (2016-08-31)  Stable
//
//      [Usage]      A Light-weight jQuery Compatible API
//                   with IE 8+ compatibility.
//
//
//          (C)2015-2016    shiy2008@gmail.com
//


define([
    'extension/iBrowser', 'iObject', 'iUtility', 'extension/iUtility',
    'iPseudo', 'iEvent', 'extension/iEvent', 'extension/IE-8', 'extension/HTML-5',
    'iAnimation', 'extension/iDOM', 'extension/iCSS', 'extension/iSelection',
    'extension/iObserver',
    'iAJAX', 'AJAX_DOM', 'extension/HTML-5_Form', 'extension/iAJAX'
],  function ($) {

    var BOM = self;

    if (typeof BOM.jQuery != 'function')  BOM.$ = BOM.jQuery = $;

    return $;

});