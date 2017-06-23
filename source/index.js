//
//                >>>  iQuery.js  <<<
//
//
//      [Version]    v3.0  (2017-06-23)  Beta
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
    './AJAX/wrapper', './AJAX/ext/form',
    './utility/ext/binary'
],  function ($) {

    if (typeof self.jQuery === 'function')  $.patch(self.jQuery, $).ajaxPatch();

    return $;

});