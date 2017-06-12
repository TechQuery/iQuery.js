define([
    './iCore', './utility/ext/object', './DOM/utility', './AJAX/index',
    './utility/ext/binary'
],  function ($) {

    if (typeof self.jQuery === 'function')  $.patch(self.jQuery, $);

    return $;

});