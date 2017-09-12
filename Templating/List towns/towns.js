function attachEvents() {
    let source = $('#towns-template').html();
    let template = Handlebars.compile(source);
    let context ={};

    $('#btnLoadTowns').click(() => {
        $('#root').empty();
        let towns = $('#towns').val().split(', ');
        context.towns = [];
        towns.forEach(t => context.towns.push({town:t}));
        let html = template(context);
        $('#root').append(html);
    });
}


