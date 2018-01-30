'use strict';

require('should');



const Path = require('path');

const TestKit = require(Path.relative(
    Path.dirname(module.filename),
    Path.join(process.cwd(), 'build/TestKit')
));

after(TestKit.exit.bind(null, 0));


describe('utility/ext/string.js', function() {



    before(TestKit.pageLoad.bind(null, 'utility/ext/string'));


    describe('$.split', function() {



        it('原型方法等效', function() {

            return TestKit.chrome.evaluate(function() {

                return $.split('abc', '');

            }).should.be.fulfilledWith(['a', 'b', 'c']);
        });


        it('PHP str_split() 等效', function() {

            return TestKit.chrome.evaluate(function() {

                return $.split('abc', '', 2);

            }).should.be.fulfilledWith(['a', 'bc']);
        });


        it('连接字符串', function() {

            return TestKit.chrome.evaluate(function() {

                return $.split("a  b\tc", /\s+/, 2, ' ');

            }).should.be.fulfilledWith(['a', 'b c']);
        });

    });

    describe('$.hyphenCase', function() {



        it('符号间隔', function() {

            return TestKit.chrome.evaluate(function() {

                return $.hyphenCase('UPPER_CASE');

            }).should.be.fulfilledWith('upper-case');
        });


        it('驼峰法', function() {

            return TestKit.chrome.evaluate(function() {

                return $.hyphenCase('camelCase');

            }).should.be.fulfilledWith('camel-case');
        });


        it('混杂写法', function() {

            return TestKit.chrome.evaluate(function() {

                return $.hyphenCase('UPPER_CASEMix -camelCase');

            }).should.be.fulfilledWith('upper-case-mix-camel-case');
        });

    });

});