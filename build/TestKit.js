const Path = require('path'),
      HTMLPages = require('html-pages'),
      Chromy = require('chromy');

const server = HTMLPages('./', {
          'log-level':    'warn'
      });

async function exit(code) {

    await Chromy.cleanup();

    server.stop();

    process.exit((code != null) ? code : 1);
};

process.on('uncaughtException', exit);

process.on('unhandledRejection', exit);

process.on('SIGINT', exit);

process.on('exit', exit);


exports.exit = exit;

exports.require = new Function(`

    return  new Promise(function () {

        require(['iQuery', '${
            Path.relative(
                Path.join(process.cwd(), 'test'),
                module.parent.filename.slice(0, -3)
            ).replace(/\\/g, '/')
        }'],  arguments[0],  arguments[1]);
    });
`);