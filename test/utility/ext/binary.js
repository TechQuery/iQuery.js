'use strict';

require('should');



const Path = require('path');

const TestKit = require(Path.relative(
    Path.dirname(module.filename),
    Path.join(process.cwd(), 'build/TestKit')
));

after(TestKit.exit.bind(null, 0));


describe('utility/ext/binary.js', function() {



    before(TestKit.pageLoad.bind(null, 'utility/ext/binary'));


    describe('$.bitOperate', function() {



        it('按位或', function() {

            return TestKit.chrome.evaluate(function() {

                return $.bitOperate('|', '10'.repeat(16), '01'.repeat(16));

            }).should.be.fulfilledWith('1'.repeat(32));
        });

    });

});