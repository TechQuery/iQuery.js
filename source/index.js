define([
    './iQuery', './DOM/insert', './CSS/ext/rule', './CSS/ext/utility',
    './AJAX/wrapper', './utility/ext/binary'
],  function ($) {

    if (typeof self.jQuery === 'function')  $.patch(self.jQuery, $);

    return $;

});