'use strict';

require('should');



const Path = require('path');

const TestKit = require(Path.relative(
        Path.dirname( module.filename ),
        Path.join(process.cwd(), 'build/TestKit')
    ));

after( TestKit.exit.bind(null, 0) );

describe('AJAX/ext/URL.js',  function () {



    before( TestKit.pageLoad.bind(null, 'AJAX/ext/URL') );



    describe('$.paramJSON',  function () {



        it('URL 查询字符串',  function () {

            return  TestKit.chrome.evaluate(function () {

                return  $.paramJSON('?a=1&b=two&b=true');

            }).should.be.fulfilledWith( {
            a:    1,
            b:    ['two', true]
        } );
        });
    });



    describe('$.filePath',  function () {



        it('传 相对路径 时返回其目录',  function () {

            return  TestKit.chrome.evaluate(function () {

                return  $.filePath('/test/unit.html');

            }).should.be.fulfilledWith( '/test/' );
        });

        it('传 查询字符串 时返回空字符串',  function () {

            return  TestKit.chrome.evaluate(function () {

                return  $.filePath('?query=string');

            }).should.be.fulfilledWith( '' );
        });

        it('传 URL（字符串）时返回其目录',  function () {

            return  TestKit.chrome.evaluate(function () {

                return  $.filePath('http://localhost:8084/test/unit.html');

            }).should.be.fulfilledWith( 'http://localhost:8084/test/' );
        });

        it('传 URL（对象）时返回其目录',  function () {

            return  TestKit.chrome.evaluate(function () {

                return  $.filePath(new URL('http://localhost:8084/test/unit.html'));

            }).should.be.fulfilledWith( 'http://localhost:8084/test/' );
        });
    });



    describe('$.urlDomain',  function () {



        it('给定 URL',  function () {

            return  TestKit.chrome.evaluate(function () {

                return  $.urlDomain('http://localhost:8080/path?query=string');

            }).should.be.fulfilledWith( 'http://localhost:8080' );
        });
    });



    describe('$.isXDomain',  function () {



        it('跨域 绝对路径',  function () {

            return  TestKit.chrome.evaluate(function () {

                return  $.isXDomain('http://localhost/iQuery');

            }).should.be.fulfilledWith( true );
        });

        it('同域 相对路径',  function () {

            return  TestKit.chrome.evaluate(function () {

                return  $.isXDomain('/iQuery');

            }).should.be.fulfilledWith( false );
        });
    });

});