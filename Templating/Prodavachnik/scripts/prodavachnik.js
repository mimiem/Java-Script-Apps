function startApp() {
    const loggedInUser = $('#loggedInUser');
    const templates = {};

    loadTemplates();

    async function loadTemplates() {
        const [adsCatalogTemplate, adPartial, detailsTemplate] = await Promise.all([
            $.get('./templates/ads-catalog.html'),
            $.get('./templates/ad-partial.html'),
            $.get('./templates/details.html')
        ]);

        templates.catalog = Handlebars.compile(adsCatalogTemplate);
        Handlebars.registerPartial('ad', adPartial);
        templates.details = Handlebars.compile(detailsTemplate);
    }

    showHideMenuLinks();
    showView('home');

    // Bind the navigation menu links
    $("#linkHome").click(()=>showView('home'));
    $("#linkLogin").click(() => showView('login'));
    $("#linkRegister").click(() => showView('register'));
    $("#linkListAds").click(() => showView('ads'));
    $("#linkCreateAd").click(() => showView('create'));
    $("#linkLogout").click(logoutUser);

    // Bind the form submit buttons
    $("#buttonLoginUser").click(loginUser);
    $("#buttonRegisterUser").click(registerUser);
    $("#buttonCreateAd").click(createAd);

    function showHideMenuLinks() {
        // Checks if user is logged in and shows the menu links
        if(localStorage.getItem('authToken') !== null &&
            localStorage.getItem('username') !== null){
            greetUser();
            $("#linkLogin").hide();
            $("#linkRegister").hide();
            $("#linkListAds").show();
            $("#linkCreateAd").show();
            $("#linkLogout").show();
        } else{
            $('#loggedInUser').text('');
            $('#loggedInUser').hide();
            $("#linkLogin").show();
            $("#linkRegister").show();
            $("#linkListAds").hide();
            $("#linkCreateAd").hide();
            $("#linkLogout").hide();
        }

    }

    function showView(viewName) {
        // Hide all views and show the selected view only
        $('section').hide();

        switch (viewName){
            case 'home': $("#viewHome").show(); break;
            case 'login': $("#viewLogin").show(); break;
            case 'register': $("#viewRegister").show(); break;
            case 'ads': $("#viewAds").show(); loadAds(); break;
            case 'create': $("#viewCreateAd").show(); break;
            case 'edit': $("#viewEditAd").show(); break;
            case 'detail': $("#viewDetails").show(); break;
        }
    }

    //Notifications
    $("#infoBox, #errorBox").click(function() {
        $(this).fadeOut();
    });

    $(document).on({
        ajaxStart: () => $("#loadingBox").show(),
        ajaxStop: () => $("#loadingBox").hide()
    });

    $("#infoBox").click((event) => $(event.target).hide());
    $("#errorBox").click((event) => $(event.target).hide());

    function showInfo(message) {
        $("#infoBox").text(message);
        $("#infoBox").show();
        setTimeout(() => $("#infoBox").fadeOut(), 3000);
    }

    function showError(message) {
        $("#errorBox").text(message);
        $("#errorBox").show();
    }

    function handleError(reason) {
        showError(reason.responseJSON.description);
    }

    // IIFE that creates requests
    let requester = (() => {
        const appKey = 'kid_ryjJEjbPZ';
        const appSecret = 'a0b1331098ed44ea83e36eff197262fe';
        const baseUrl = 'https://baas.kinvey.com/';

        function makeAuth(auth) {
            if (auth === 'basic'){
                return 'Basic ' + btoa(appKey + ':' + appSecret);
            } else {
                return 'Kinvey ' + localStorage.getItem('authToken');
            }
        }

        function makeRequest(method, module, url, auth) {
            return {
                url: baseUrl + module + '/' + appKey + '/' + url,
                method: method,
                headers: {
                    'Authorization': makeAuth(auth)
                },
            };
        }

        function get(module, url, auth) {
            return $.ajax(makeRequest('GET', module,url,auth));
        }

        function post(module, url, data, auth) {
            let req = makeRequest('POST', module,url,auth);
            req.data = JSON.stringify(data);
            req.headers['Content-Type'] = 'application/json';
            return $.ajax(req);
        }

        function update(module, url, data, auth) {
            let req = makeRequest('PUT', module,url,auth);
            req.data = JSON.stringify(data);
            req.headers['Content-Type'] = 'application/json';
            return $.ajax(req);
        }

        function remove(module, url, auth) {
            return $.ajax(makeRequest("DELETE", module, url, auth))
        }

        return { get, post, update, remove};
    })();

    async function loginUser() {
        let username = $('#formLogin input[name=username]').val();
        let password = $('#formLogin input[name=passwd]').val();

        if (username.length === 0){
            showError("Username cannot be empty");
            return;
        }

        if (password.length === 0){
            showError("Password cannot be empty");
            return;
        }

        try {
            let data = await requester.post('user', 'login', {username: username,password: password},'basic');
            showInfo("Logged in");
            saveSession(data);
            showView('ads');
            showHideMenuLinks();
        } catch(err){
            handleError(err);
        }

    }
    
    async function registerUser() {
        let username = $('#formRegister input[name=username]').val();
        let password = $('#formRegister input[name=passwd]').val();
        let confirmPassword = $('#formRegister input[name=confirmPasswd]').val();

        if (username.length === 0){
            showError("Username cannot be empty");
            return;
        }

        if (password.length === 0){
            showError("Password cannot be empty");
            return;
        }

        if (confirmPassword.length === 0){
            showError("Confirm password cannot be empty");
            return;
        }

        if (password !== confirmPassword){
            showError("Passwords do not match");
            return;
        }

        try {
            let data = await requester.post('user', '', {username: username,password: password},'basic');
            showInfo("Registered");
            saveSession(data);
            showView('ads');
            showHideMenuLinks();
        } catch(err){
            handleError(err);
        }

    }

    function saveSession(data) {
        localStorage.setItem('username', data.username);
        localStorage.setItem('id', data._id);
        localStorage.setItem('authToken', data._kmd.authtoken);
        loggedInUser.text(`Welcome, ${data.username}!`);
        loggedInUser.show();
    }

    function greetUser() {
        loggedInUser.text(`Welcome, ${localStorage.getItem('username')}!`);
        loggedInUser.show();
    }

    async function loadAds() {
        let content = $('#ads');
        content.empty();
        let ads = await requester.get('appdata', 'entities');
        //Sort adverts by count, descending
        ads = ads.sort((a,b)=> b.count - a.count);

        ads.forEach(a => {
            if(a._acl.creator === localStorage.getItem('id')){
                a.isAuthor = true;
            }
        });

        let context = {
            ads
        };

        let html = templates.catalog(context);
        content.html(html);

        let readMoreButtons = $(content).find('.row').find('.readMore');
        let editButtons = $(content).find('.row').find('.edit');
        let deleteButtons = $(content).find('.row').find('.delete');
        readMoreButtons.click(displayAdvert);
        editButtons.click(showEditForm);
        deleteButtons.click(removeAd);
    }

    //Display details after click 'Read more'
    async function displayAdvert() {
        let id = $(this).parent().parent().attr('data-id');
        let ad = await requester.get('appdata',`entities/${id}`);
        let content = $('#viewDetailsAd');
        content.empty();

        let context = {
            image: ad.Image,
            title: ad.title,
            description: ad.description,
            publisher: ad.publisher,
            publishDate: ad.publishDate
        };

        let html = templates.details(context);
        content.html(html);
        showView('detail');
        //updateCount(ad);
    }

    //Update count of the views
    /* does not work when logged user display an ad that is not his
    async function updateCount(ad){
        ad.count += 1;
        await requester.update('appdata','entities/' + ad._id, ad);
    }
    */

    async function createAd() {
        let createForm = $('#formCreateAd');
        let title = createForm.find('input[name=title]').val();
        let description = createForm.find('textarea[name=description]').val();
        let price = +createForm.find('input[name=price]').val();
        let image = createForm.find('input[name=image]').val();

        if (title.length === 0){
            showError("Title cannot be empty");
            return;
        }

        if (price === 0){
            showError("Price cannot be empty");
            return;
        }

        let data = {
            title: title,
            description: description,
            price: price,
            publishDate: new Date().toISOString().slice(0,10),
            publisher: localStorage.getItem('username'),
            Image: image,
            count: 0
        };

        try{
            await requester.post('appdata','entities', data);
            showInfo("Created");
            showView('ads');
        } catch(err){
            handleError(err);
        }
    }
    
    async function showEditForm() {
        let id = $(this).parent().parent().attr('data-id');
        let ad = await requester.get('appdata',`entities/${id}`);
        let editForm = $('#formEditAd');
        editForm.find('input[name=id]').val(id);
        editForm.find('input[name=count]').val(ad.count);
        editForm.find('input[name=title]').val(ad.title);
        editForm.find('textarea[name=description]').val(ad.description);
        editForm.find('input[name=price]').val(ad.price);
        editForm.find('input[name=image]').val(ad.Image);

        $("#buttonEditAd").click(()=>editAd(id, ad.publisher, ad.publishDate));
        showView('edit');
    }

    async function editAd(id, publisher, date) {
        let editFormAd = $('#formEditAd');
        let count = +editFormAd.find('input[name=count]').val();
        let title = editFormAd.find('input[name=title]').val();
        let description = editFormAd.find('textarea[name=description]').val();
        let price = +editFormAd.find('input[name=price]').val();
        let image = editFormAd.find('input[name=image]').val();

        if (title.length === 0){
            showError("Title cannot be empty");
            return;
        }

        if (price === 0){
            showError("Price cannot be empty");
            return;
        }

        let data = {
            title: title,
            description: description,
            price: price,
            publishDate: date,
            publisher: publisher,
            Image: image,
            count: count
        };

        try {
            await requester.update('appdata', 'entities/' + id, data);
            showInfo("Edited");
            showView('ads');
        } catch(err){
            handleError(err);
        }

    }

    async function removeAd() {
        let id = $(this).parent().parent().attr('data-id');

        try{
            await requester.remove('appdata', `entities/${id}`);
            showInfo("Deleted");
            showView("ads");
        } catch(err){
            handleError(err);
        }
    }

    async function logoutUser() {
        try {
            await requester.post('user', '_logout', { authtoken: localStorage.getItem('authToken')});
            showInfo("Logged out");
            localStorage.clear();
            showView('home');
            showHideMenuLinks();
            // Clear user auth data
            localStorage.clear();
        } catch(err){
            console.log(err.statusText);
        }
    }
}