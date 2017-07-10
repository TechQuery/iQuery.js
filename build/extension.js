module.exports = function () {

    if (! /(polyfill|ext)\W/.test( this.name ))  return '';

    if (/^[\s\S]*?\(function \(\$\W/.test( this.source ))
        return this.source.replace(
            /^(\}\)\()\w*([\s\S]*?\);)$/m,
            function () {

                return  `${ arguments[1] }jquery${ arguments[2] }`;
            }
        );
};