'use strict';

exports.itemWrite = function (item) {

    item.source = `

    it('${item.title}',  function () {

        return  TestKit.chrome.evaluate(function () {

            return  ${item.script};

        }).should.be.fulfilledWith( ${item.expected} );
    });
`;
};
