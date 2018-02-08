/**
 * iQuery.js - A Light-weight jQuery Compatible API with IE 8+ compatibility
 *
 * @module    {function} iQuery
 * @version   3.1 (2018-02-08) stable
 *
 * @copyright TechQuery <shiy2008@gmail.com> 2015-2018
 * @license   GPL-2.0-or-later
 *
 * @see       {@link http://jquery.com/ jQuery}
 */


define([
    './iQuery',
    './DOM/ext/utility', './DOM/ext/selection',
    './CSS/ext/rule', './CSS/ext/utility',
    './event/ext/shim', './event/ext/wrapper',
    './AJAX/ext/wrapper', './AJAX/ext/form',
    './utility/ext/Template', './utility/ext/binary',
    './animate/effect'
],  function ($) {

    if (typeof self.jQuery !== 'function')  self.$ = self.jQuery = $;

    return  self.iQuery = $;

});
