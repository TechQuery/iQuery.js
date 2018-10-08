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

describe('utility/ext/Template.js', function() {

    before(async () => page = await pageLoad())

    describe('Template', function() {



        it('局部变量成员名', () => page.evaluate(() => {

            return $.Template('[ ${new Date()} ]  Hello, ${this.name} !')[0];

        }).should.be.fulfilledWith('name'));
    });

    describe('Template#evaluate', function() {



        it('模板求值', () => page.evaluate(() => {

            return $.Template(
                "[ ${this.time} ]  Hello, ${scope.creator}'s ${view.name} !", ['view', 'scope']
            ).evaluate({
                time: '2015-04-30'
            }, {
                name: 'iQuery.js'
            }, {
                creator: 'TechQuery'
            });

        }).should.be.fulfilledWith("[ 2015-04-30 ]  Hello, TechQuery's iQuery.js !"));
    });

});