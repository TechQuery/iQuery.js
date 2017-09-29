//
//                >>>  iQuery.js  <<<
//
//
//      [Version]    v3.0  (2017-09-29)  Beta
//
//      [Usage]      A Light-weight jQuery Compatible API
//                   with IE 8+ compatibility.
//
//
//          (C)2015-2017    shiy2008@gmail.com
//


define([
    './iQuery',
    './DOM/insert', './DOM/ext/selection',
    './CSS/ext/rule', './CSS/ext/utility',
    './event/ext/shim', './event/ext/wrapper',
    './AJAX/ext/wrapper', './AJAX/ext/form',
    './animate/effect', './utility/ext/binary'
],  function ($) {

    if (typeof self.jQuery !== 'function')  self.$ = self.jQuery = $;

    return  self.iQuery = $;

});