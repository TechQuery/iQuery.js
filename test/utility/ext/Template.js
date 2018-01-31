'use strict';

require('should');



const Path = require('path');

const TestKit = require(Path.relative(
    Path.dirname(module.filename),
    Path.join(process.cwd(), 'build/TestKit')
));

after(TestKit.exit.bind(null, 0));


describe('utility/ext/Template.js', function() {



    before(TestKit.pageLoad.bind(null, 'utility/ext/Template'));


    describe('Template#evaluate', function() {



        it('模板求值', function() {

            return TestKit.chrome.evaluate(function() {

                return $.Template(
                    "[ ${this.time} ]  Hello, ${scope.creator}'s ${view.name} !", ['view', 'scope']
                ).evaluate({
                    time: '2015-04-30'
                }, {
                    name: 'iQuery.js'
                }, {
                    creator: 'TechQuery'
                });

            }).should.be.fulfilledWith("[ 2015-04-30 ]  Hello, TechQuery's iQuery.js !");
        });

    });

});