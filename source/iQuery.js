//
//                >>>  iQuery.js  <<<
//
//
//      [Version]    v1.0  (2016-05-14)  Stable
//
//      [Usage]      A Light-weight jQuery Compatible API
//                   with IE 8+ compatibility.
//
//
//          (C)2015-2016    shiy2008@gmail.com
//


define([
    'ES-5',
    'iCore', 'iEvent',
    'IE-8',
    'iAnimation', 'iAJAX',
    'HTML-5', 'HTML-5_Form'
],  function () {
    return  (self.$ = self.jQuery = self.iQuery = arguments[1]);
});