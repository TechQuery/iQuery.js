define([
    './iCore', './utility/ext/ObjectKit'
],  function ($, ObjectKit) {

    $.extend( ObjectKit );

    if (typeof self.jQuery === 'function')  $.patch(self.jQuery, $);

    return $;

});