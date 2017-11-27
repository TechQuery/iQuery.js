'use strict';

require('should');



const Path = require('path');

const TestKit = require(Path.relative(
        Path.dirname( module.filename ),
        Path.join(process.cwd(), 'build/TestKit')
    ));

after( TestKit.exit.bind(null, 0) );

describe('object/ext/base.js',  function () {



    before( TestKit.pageLoad.bind(null, 'object/ext/base') );



    describe('$.likeArray',  function () {



        it('字符串元素不可变，故不是类数组',  function () {

            return  TestKit.chrome.evaluate(function () {

                return  $.likeArray(new String(''));

            }).should.be.fulfilledWith( false );
        });

        it('有 length 属性、但没有对应数量元素的，不是类数组',  function () {

            return  TestKit.chrome.evaluate(function () {

                return  $.likeArray({0: 'a', length: 2});

            }).should.be.fulfilledWith( false );
        });

        it('NodeList、HTMLCollection、jQuery 等是类数组',  function () {

            return  TestKit.chrome.evaluate(function () {

                return  $.likeArray( document.head.childNodes );

            }).should.be.fulfilledWith( true );
        });

        it('Node 及其子类不是类数组',  function () {

            return  TestKit.chrome.evaluate(function () {

                return  $.likeArray( document.createTextNode('') );

            }).should.be.fulfilledWith( false );
        });
    });

});