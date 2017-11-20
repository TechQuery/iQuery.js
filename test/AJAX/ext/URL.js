const TestKit = require('../../../build/TestKit'),
      assert = require('assert'),
      Chromy = require('chromy');

const chrome = new Chromy();


before(async function () {

    await chrome.goto('http://localhost:8084/test/unit.html');

    await chrome.evaluate( TestKit.require );
});


describe('$.filePath()',  function () {

    it('传 相对路径 时返回其目录',  async function () {

        var path = await chrome.evaluate(function () {

                return  require('iQuery').filePath( location.pathname );
            });

        assert.equal(path, '/test/');
    });

    it('传 查询字符串 时返回空字符串',  async function () {

        var path = await chrome.evaluate(function () {

                return  require('iQuery').filePath( location.search );
            });

        assert.equal(path, '');
    });

    it('传 URL（字符串）时返回其目录',  async function () {

        var path = await chrome.evaluate(function () {

                return  require('iQuery').filePath( location.href );
            });

        assert.equal(path, 'http://localhost:8084/test/');
    });

    it('传 URL（对象）时返回其目录',  async function () {

        var path = await chrome.evaluate(function () {

                return  require('iQuery').filePath( location );
            });

        assert.equal(path, 'http://localhost:8084/test/');
    });

    it('没传参时应返回 location.href 的目录',  async function () {

        var path = await chrome.evaluate(function () {

                return require('iQuery').filePath();
            });

        assert.equal(path, 'http://localhost:8084/test/');
    });
});


describe('$.isXDomain()',  function () {

    it('跨域 绝对路径',  async function () {

        var result = await chrome.evaluate(function () {

                return require('iQuery').isXDomain('http://localhost/iQuery');
            });

        assert.strictEqual(result, true);
    });

    it('同域 相对路径',  async function () {

        var result = await chrome.evaluate(function () {

                return require('iQuery').isXDomain('/iQuery');
            });

        assert.strictEqual(result, false);
    });
});


after( TestKit.exit.bind(null, 0) );
