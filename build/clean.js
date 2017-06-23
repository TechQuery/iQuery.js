#! /usr/bin/env node


var text = '',  name = process.argv[2];

var UMD = `(function (factory) {

    if ((typeof define === 'function')  &&  define.amd)
        define('${name}', factory);
    else if (typeof module === 'object')
        module.exports = factory();
    else
        this.${name} = factory();

})(function () {\n\n`;


process.stdin.setEncoding('utf8');

process.stdin.on('readable',  function () {

    text += process.stdin.read();

}).on('end',  function () {

    require('fs').writeFileSync(
        `./${name}.js`,
        require('amdclean').clean({
            code:         text,
            escodegen:    {
                format:    {
                    indent:     {style: '    '},
                    newline:    '\n\n'
                }
            },
            wrap:         {
                start:    UMD,
                end:      `return  ${name} || index;\n});`
            }
        })
    );
});