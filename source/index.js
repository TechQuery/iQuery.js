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