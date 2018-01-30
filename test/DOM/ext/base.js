'use strict';

require('should');



const Path = require('path');

const TestKit = require(Path.relative(
    Path.dirname(module.filename),
    Path.join(process.cwd(), 'build/TestKit')
));

after(TestKit.exit.bind(null, 0));


describe('DOM/ext/base.js', function() {



    before(TestKit.pageLoad.bind(null, 'DOM/ext/base'));


    describe('$#insertTo', function() {



        it('插入到最前', function() {

            return TestKit.chrome.evaluate(function() {

                return $('<a>insert</a>').insertTo('body') && (
                    $('body > :first-child')[0].textContent
                );

            }).should.be.fulfilledWith('insert');
        });


        it('插入到最后', function() {

            return TestKit.chrome.evaluate(function() {

                return $('<a>insert</a>').insertTo('body', Infinity) && (
                    $('body > :last-child')[0].textContent
                );

            }).should.be.fulfilledWith('insert');
        });

    });

    describe('$#htmlExec', function() {



        it('同步执行脚本', function() {

            return TestKit.chrome.evaluate(function() {

                return $('body').htmlExec(
                    "<script>self.test = $('body')[0].lastChild.tagName;</script>xxx"
                ) && self.test;

            }).should.be.fulfilledWith('SCRIPT');
        });


        it('CSS 选择符不执行脚本', function() {

            return TestKit.chrome.evaluate(function() {

                return $('body').htmlExec(
                    "<script>self.name = 'xxx';</script><a /><b />", 'script, a'
                ) && (
                    self.name + $('body')[0].children.length
                );

            }).should.be.fulfilledWith('2');
        });

    });

});