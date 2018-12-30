'use strict';

require('should');

const Path = require('path');

const { pageLoad } = require(Path.relative(
    Path.dirname(module.filename),
    Path.join(process.cwd(), 'test/TestKit')
));

var page;

describe('utility/ext/string.js', function() {
    before(async () => (page = await pageLoad()));

    describe('$.split', function() {
        it('原型方法等效', () =>
            page
                .evaluate(() => {
                    return $.split('abc', '');
                })
                .should.be.fulfilledWith(['a', 'b', 'c']));

        it('PHP str_split() 等效', () =>
            page
                .evaluate(() => {
                    return $.split('abc', '', 2);
                })
                .should.be.fulfilledWith(['a', 'bc']));

        it('连接字符串', () =>
            page
                .evaluate(() => {
                    return $.split('a  b\tc', /\s+/, 2, ' ');
                })
                .should.be.fulfilledWith(['a', 'b c']));
    });

    describe('$.hyphenCase', function() {
        it('符号间隔', () =>
            page
                .evaluate(() => {
                    return $.hyphenCase('UPPER_CASE');
                })
                .should.be.fulfilledWith('upper-case'));

        it('驼峰法', () =>
            page
                .evaluate(() => {
                    return $.hyphenCase('camelCase');
                })
                .should.be.fulfilledWith('camel-case'));

        it('混杂写法', () =>
            page
                .evaluate(() => {
                    return $.hyphenCase('UPPER_CASEMix -camelCase');
                })
                .should.be.fulfilledWith('upper-case-mix-camel-case'));
    });
});