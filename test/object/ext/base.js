'use strict';

require('should');

const Path = require('path');

const { pageLoad } = require(Path.relative(
    Path.dirname(module.filename),
    Path.join(process.cwd(), 'test/TestKit')
));

var page;

describe('object/ext/base.js', function() {
    before(async () => (page = await pageLoad()));

    describe('$.likeArray', function() {
        it('字符串元素不可变，故不是类数组', () =>
            page
                .evaluate(() => {
                    return $.likeArray(new String(''));
                })
                .should.be.fulfilledWith(false));

        it('有 length 属性、但没有对应数量元素的，不是类数组', () =>
            page
                .evaluate(() => {
                    return $.likeArray({ 0: 'a', length: 2 });
                })
                .should.be.fulfilledWith(false));

        it('NodeList、HTMLCollection、jQuery 等是类数组', () =>
            page
                .evaluate(() => {
                    return $.likeArray(document.head.childNodes);
                })
                .should.be.fulfilledWith(true));

        it('Node 及其子类不是类数组', () =>
            page
                .evaluate(() => {
                    return $.likeArray(document.createTextNode(''));
                })
                .should.be.fulfilledWith(false));
    });

    describe('$.isEqual', function() {
        it('基本类型比较', () =>
            page
                .evaluate(() => {
                    return $.isEqual(1, 1);
                })
                .should.be.fulfilledWith(true));

        it('引用类型（浅）', () =>
            page
                .evaluate(() => {
                    return $.isEqual({ a: 1 }, { a: 1 });
                })
                .should.be.fulfilledWith(true));

        it('引用类型（深）', () =>
            page
                .evaluate(() => {
                    return $.isEqual(
                        { a: 1, b: { c: 2 } },
                        { a: 1, b: { c: 2 } },
                        2
                    );
                })
                .should.be.fulfilledWith(true));
    });

    describe('$.mapTree', function() {
        it('DOM 树遍历', () =>
            page
                .evaluate(() => {
                    return $.mapTree(
                        $('<a>A<b>B<!--C--></b></a>')[0],
                        'childNodes',
                        function(node, index, depth) {
                            return (
                                depth +
                                (node.nodeType === 3 ? node.nodeValue : '')
                            );
                        }
                    ).join('');
                })
                .should.be.fulfilledWith('1A12B2'));
    });
});