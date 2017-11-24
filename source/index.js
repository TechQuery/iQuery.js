/**
 * iQuery.js - A Light-weight jQuery Compatible API with IE 8+ compatibility
 *
 * @module    {function} iQuery
 *
 * @version   3.0 (2017-11-24) stable
 *
 * @see       {@link http://jquery.com/ jQuery}
 *
 * @copyright TechQuery <shiy2008@gmail.com> 2015-2017
 */


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
