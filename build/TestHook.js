'use strict';


exports.fileWrite = function (header) {

    header.source = `

const Path = require('path');

const TestKit = require(Path.relative(
          Path.dirname( module.filename ),
          Path.join(process.cwd(), 'build/TestKit')
      ));

after( TestKit.exit.bind(null, 0) );
`;
};


exports.headerWrite = function (header) {

    header.source = `

    before( TestKit.pageLoad.bind(null, '${header.URI.replace(/\.\w+$/, '')}') );
`;
};


exports.itemWrite = function (item) {

    item.source = `

        it('${item.title}',  function () {

            return  TestKit.chrome.evaluate(function () {

                return  ${item.script};

            }).should.be.fulfilledWith( ${item.expected} );
        });
    `;
};
