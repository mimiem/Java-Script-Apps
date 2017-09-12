$(() => {
    renderCatTemplate();

    function renderCatTemplate() {
        // TODO: Render cat template and attach events
        let source = $('#cat-template').html();
        let template = Handlebars.compile(source);
        for (let cat of window.cats) {
            let div = template(cat);
            $('#allCats').append(div);
        }
        $('.btn').click(hideShowStatusCode);
    }

    function hideShowStatusCode() {
        let current = $(this);
        if (current.text() === 'Show status code'){
            current.text('Hide status code');
            current.parent().find('div').show();

        } else{
            current.text('Show status code');
            current.parent().find('div').hide();
        }
    }
});
