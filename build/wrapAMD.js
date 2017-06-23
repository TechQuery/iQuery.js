#! /usr/bin/env node


var data = {
        AMD_ID:        process.argv[2],
        AMD_Buddle:    ''
    },
    FS = require('fs'),  Path = require('path');


process.stdin.setEncoding('utf8');

process.stdin.on('readable',  function () {

    data.AMD_Buddle += process.stdin.read();

}).on('end',  function () {

    FS.writeFileSync(
        `./${data.AMD_ID}.js`,
        FS.readFileSync(
            Path.join(Path.dirname( process.argv[1] ),  'UMD_wrapper.js'),
            {encoding:  'utf-8'}
        ).replace(
            /\/\*\s+(\S+?)\s+\*\//g,  function (raw, key) {

                return  (data[key] != null)  ?  data[key]  :  raw;
            }
        )
    );
});