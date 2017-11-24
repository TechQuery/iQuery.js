const Path = require('path');

const TestKit = require(Path.relative(
          Path.dirname( module.filename ),
          Path.join(process.cwd(), 'build/TestKit')
      ));

before( TestKit.beforeAll );

after( TestKit.exit.bind(null, 0) );
