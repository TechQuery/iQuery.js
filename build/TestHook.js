'use strict';


exports.fileWrite = header => {

    header.source = `

const Path = require('path');

const { pageLoad } = require(Path.relative(
          Path.dirname( module.filename ),
          Path.join(process.cwd(), 'test/TestKit')
      ));


var page;`.trim();
};


exports.headerWrite = header => {

    header.source = 'before(async () => page = await pageLoad())';
};


exports.itemWrite = item => {

    item.source = `

        it('${item.title}',  () => page.evaluate(() => {

                return  ${item.script};

        }).should.be.fulfilledWith( ${item.expected} ));`;
};
