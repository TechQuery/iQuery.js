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


    return  function (HTML) {

        var tag = HTML.match(
                /^\s*<([^\s\/\>]+)\s*([^<]*?)\s*(\/?)>([^<]*)((<\/\1>)?)([\s\S]*)/
            ) || [ ];

        if (tag[5] === undefined)  tag[5] = '';

        if (
            (tag[5]  &&  (! (tag.slice(2, 5).join('') + tag[6])))  ||
            (tag[3]  &&  (! (tag[2] + tag.slice(4).join(''))))
        )
            return  [DOM.createElement( tag[1] )];

        var wrapper = TagWrapper[ tag[1] ],  box = DOM.createElement('div');

        if (! wrapper)
            box.innerHTML = HTML;
        else {
            box.innerHTML =
                wrapper.before  +  HTML  +  (wrapper.after || '');

            box = $.trace(box,  'firstChild',  wrapper.depth || 1)
                .slice(-1)[0];
        }

        return  $.each($.makeArray( box.childNodes ),  function () {

            return this.remove();
        });
    };
});
