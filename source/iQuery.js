define([
    './iCore', './utility/ext/object', './DOM/insert', './AJAX/wrapper',
    './utility/ext/binary'
],  function ($) {

    if (typeof self.jQuery === 'function')  $.patch(self.jQuery, $);

    return $;

});