(function (BOM, DOM, $) {

/* ---------- 顶部导航栏 ---------- */

    $('a[href^="#"]').click(function () {
        arguments[0].preventDefault();

        $(DOM.body).scrollTo( this.getAttribute('href') );
    });


    $('body > .Head form').submit(function () {
        var $_KeyWord = $('input[type="search"]', this);

        var iValue = $_KeyWord[0].value;

        $_KeyWord.one('blur',  function () {

            this.value = iValue;

        })[0].value += ' site:tech_query.oschina.io';
    });

})(self, self.document, self.jQuery);