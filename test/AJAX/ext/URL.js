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

describe('AJAX/ext/URL.js', function() {

    before(async () => page = await pageLoad())

    describe('$.paramJSON', function() {



        it('URL 查询字符串', () => page.evaluate(() => {

            return $.paramJSON('?a=1&b=two&b=true');

        }).should.be.fulfilledWith({
            a: 1,
            b: ['two', true]
        }));
    });

    describe('$.extendURL', function() {



        it('多种参数', () => page.evaluate(() => {

            return $.extendURL('path/to/model?a=0', 'a=1&b=1', {
                b: 2,
                c: 3
            });

        }).should.be.fulfilledWith('path/to/model?a=1&b=2&c=3'));
    });

    describe('$.filePath', function() {



        it('传 相对路径 时返回其目录', () => page.evaluate(() => {

            return $.filePath('/test/unit.html');

        }).should.be.fulfilledWith('/test/'));

        it('传 查询字符串 时返回空字符串', () => page.evaluate(() => {

            return $.filePath('?query=string');

        }).should.be.fulfilledWith(''));

        it('传 URL（字符串）时返回其目录', () => page.evaluate(() => {

            return $.filePath('http://localhost:8084/test/unit.html');

        }).should.be.fulfilledWith('http://localhost:8084/test/'));

        it('传 URL（对象）时返回其目录', () => page.evaluate(() => {

            return $.filePath(new URL('http://localhost:8084/test/unit.html'));

        }).should.be.fulfilledWith('http://localhost:8084/test/'));
    });

    describe('$.urlDomain', function() {



        it('给定 URL', () => page.evaluate(() => {

            return $.urlDomain('http://localhost:8080/path?query=string');

        }).should.be.fulfilledWith('http://localhost:8080'));
    });

    describe('$.isXDomain', function() {



        it('跨域 绝对路径', () => page.evaluate(() => {

            return $.isXDomain('http://localhost/iQuery');

        }).should.be.fulfilledWith(true));

        it('同域 相对路径', () => page.evaluate(() => {

            return $.isXDomain('/iQuery');

        }).should.be.fulfilledWith(false));
    });

});