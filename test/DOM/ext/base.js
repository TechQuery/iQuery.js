'use strict';

require('should');

const Path = require('path');

const {
    pageLoad
} = require(Path.relative(
    Path.dirname(module.filename),
    Path.join(process.cwd(), 'test/TestKit')
));


var page;

describe('DOM/ext/base.js', function() {

    before(async () => page = await pageLoad())

    describe('$#insertTo', function() {



        it('插入到最前', () => page.evaluate(() => {

            return $('<a>insert</a>').insertTo('body') && (
                $('body > :first-child')[0].textContent
            );

        }).should.be.fulfilledWith('insert'));

        it('插入到最后', () => page.evaluate(() => {

            return $('<a>insert</a>').insertTo('body', Infinity) && (
                $('body > :last-child')[0].textContent
            );

        }).should.be.fulfilledWith('insert'));
    });

    describe('$#htmlExec', function() {



        it('同步执行脚本', () => page.evaluate(() => {

            return $('body').htmlExec(
                "<script>self.test = $('body')[0].lastChild.tagName;</script>xxx"
            ) && self.test;

        }).should.be.fulfilledWith('SCRIPT'));

        it('CSS 选择符不执行脚本', () => page.evaluate(() => {

            return $('body').htmlExec(
                "<script>self.name = 'xxx';</script><a /><b />", 'script, a'
            ) && (
                self.name + $('body')[0].children.length
            );

        }).should.be.fulfilledWith('2'));
    });

});