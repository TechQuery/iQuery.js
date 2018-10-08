'use strict';

const PuppeteerBrowser = require('puppeteer-browser').default;

//  测试代码公用方法、对象

exports.pageLoad = async function () {

    const page = await PuppeteerBrowser.getPage('./', 'test/');

    await page.evaluate(()  =>  new Promise((resolve, reject) =>
        require(['iQuery'],  function check() {

            (document.readyState !== 'loading')  ?
                resolve()  :  setTimeout( check );
        }, reject)
    ));

    return page;
};
