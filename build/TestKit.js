'use strict';

const Path = require('path'),
      HTMLPages = require('html-pages'),
      Chromy = require('chromy');


//  静态文件服务器

const server = HTMLPages(process.cwd(), {
          'log-level':    'warn'
      });


//  退出前清理 服务器、浏览器

async function exit(code) {

    await Chromy.cleanup();

    server.stop();

    if (code !== 0)  process.exit(code || 1);
};

process.on('uncaughtException', exit);

process.on('unhandledRejection', exit);

process.on('SIGINT', exit);

process.on('exit',  exit.bind(null, 0));


//  测试代码公用方法、对象

exports.exit = exit;

exports.chrome = new Chromy();

exports.pageLoad = async function (sourceURI) {

    await exports.chrome.goto('http://localhost:8084/test/unit.html');

    await exports.chrome.evaluate(function () {

        return  new Promise(function (resolve, reject) {

            require(['iQuery'],  function check() {

                if (document.readyState !== 'loading')
                    resolve();
                else
                    setTimeout( check );
            }, reject);
        });
    });
};
