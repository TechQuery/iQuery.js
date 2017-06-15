define(['../object/index'],  function ($) {

    var TagWrapper = $.extend(
            {
                area:      {before: '<map>'},
                legend:    {before: '<fieldset>'},
                param:     {before: '<object>'}
            },
            $.makeSet(['caption', 'thead', 'tbody', 'tfoot', 'tr'],  {
                before:    '<table>',
                after:     '</table>',
                depth:     2
            }),
            $.makeSet(['th', 'td'],  {
                before:    '<table><tr>',
                depth:     3
            }),
            $.makeSet(['optgroup', 'option'],  {before: '<select multiple>'})
        ),
        DOM = self.document;


    return  function (iHTML) {

        var iTag = iHTML.match(
                /^\s*<([^\s\/\>]+)\s*([^<]*?)\s*(\/?)>([^<]*)((<\/\1>)?)([\s\S]*)/
            ) || [ ];

        if (iTag[5] === undefined)  iTag[5] = '';

        if (
            (iTag[5]  &&  (! (iTag.slice(2, 5).join('') + iTag[6])))  ||
            (iTag[3]  &&  (! (iTag[2] + iTag.slice(4).join(''))))
        )
            return  [DOM.createElement( iTag[1] )];

        var iWrapper = TagWrapper[ iTag[1] ],  iNew = DOM.createElement('div');

        if (! iWrapper)
            iNew.innerHTML = iHTML;
        else {
            iNew.innerHTML =
                iWrapper.before  +  iHTML  +  (iWrapper.after || '');

            iNew = $.trace(iNew,  'firstChild',  iWrapper.depth || 1)
                .slice(-1)[0];
        }

        return  Array.from(iNew.childNodes,  function (iDOM) {

            return  iDOM.parentNode.removeChild( iDOM );
        });
    };
});