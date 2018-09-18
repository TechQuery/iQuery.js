'use strict';

const WebServer = require('koapache').default, Chromy = require('chromy');

var server;


//  退出前清理 服务器、浏览器

async function exit(code) {

    await Chromy.cleanup();

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

    server = server  ||  await (new WebServer()).workerHost();

    await exports.chrome.goto(
        `http://${server.address}:${server.port}/test/unit.html`
    );

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
