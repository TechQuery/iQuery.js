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

describe('utility/ext/binary.js', function() {

    before(async () => page = await pageLoad())

    describe('$.bitOperate', function() {



        it('按位或', () => page.evaluate(() => {

            return $.bitOperate('|', '10'.repeat(16), '01'.repeat(16));

        }).should.be.fulfilledWith('1'.repeat(32)));
    });

});