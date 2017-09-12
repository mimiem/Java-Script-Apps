$(() => {
    showView('Welcome');

    //Show view one on the time
    function showView(viewName) {
        $('section').hide();
        $('#view' + viewName).show();
    }

    //Attach event handlers
    (()=> {
        $('header').find('a[data-target]').click(navigateTo);
        $('#btnRegister').click(registerUser);
        $('#btnLogin').click(loginUser);
        $('header a').click(logoutUser);
        $('#linkCatalog').click(()=>{
            getAllPosts();
            showView('Catalog')
        });

        $('#submitLink').click(()=>{
            showView('Submit');
        });

        $('#btnSubmitPost').click(createPost);

        $('#btnEditPost').click(editPost);
        
        $('#myPosts').click(()=>{
            getMyPosts();
            showView('MyPosts');
        });

        $('#btnPostComment').submit(createComment);

        $('.notification').click(function () {
            $(this).hide();
        })

    })();

    if(sessionStorage.getItem('authtoken') === null ){
        userLoggedOut();
    } else{
        userLoggedIn();
    }

    function navigateTo() {
        let viewName = $(this).attr('data-target');
        showView(viewName);
    }

    function userLoggedIn() {
        let username = sessionStorage.getItem('username');
        $('#menu').show();
        $('#profile span').text(username);
        $('#profile').show();
        getAllPosts();
        showView('Catalog');
    }

    function userLoggedOut() {
        $('#menu').hide();
        $('#profile').hide();
        $('#profile').find('span').text('');
        $('section').hide();
        showView('Welcome');
    }
    
    function getAllPosts() {
        postsService.loadAllPosts()
            .then((posts) => {
                displayPosts(posts);
            }).catch(handleError);
    }

    function displayPosts(posts) {

        let catalog = $('#viewCatalog');
        catalog.empty();
        let container = $('<div>').addClass('posts');
        let count = 1;

        for (let post of posts) {
            let article = $('<article>').addClass('post');

            let colRank = $('<div>').addClass('col rank');
            colRank.append($(`<span>${count}</span>`));

            let thumbnail = $('<div>').addClass('col thumbnail');
            thumbnail.append($(`<a href="${post.url}"><img src="${post.imageUrl}"</a>`));

            let postContent = $('<div>').addClass('post-content');
            let title = $('<div>').addClass('title');
            title.append($(`<a href="${post.url}">${post.title}</a>`));
            let details = $('<div>').addClass('details');
            details.append($(`<div class="info">submitted ${calcTime(post._kmd.lmt)} ago by ${post.author}</div>`));
            let divControls = $('<div>').addClass('controls');
            let controls = $('<ul>');
            controls.append($(`<li class="action"><a class="commentsLink" name="${post._id}" href="#">comments</a></li>`));
            if(post.author === sessionStorage.getItem('username')){
                controls.append($(`<li class="action"><a class="editLink" name="${post._id}" href="#">edit</a></li>`));
                controls.append($(`<li class="action"><a class="deleteLink" name="${post._id}" href="#">delete</a></li>`));
            }


            divControls.append(controls);
            details.append(divControls);
            postContent.append(title);
            postContent.append(details);

            article.append(colRank);
            article.append(thumbnail);
            article.append(postContent);

            container.append(article);

            count++;
        }
        catalog.append(container);
        catalog.find('.editLink').click(showEditForm);
        catalog.find('.commentsLink').click(getDetails);
        catalog.find('.deleteLink').click(deletePost);
    }

    function createPost(ev) { //http validation
        ev.preventDefault();
        let author = sessionStorage.getItem('username');
        let url = $('#submitForm input[name=url]').val();
        let title = $('#submitForm input[name=title]').val();
        let image = $('#submitForm input[name=image]').val();
        let comment = $('#submitForm textarea[name=description]').val();

        if(url === '' || title === ''){
            showError('Url and Title cannot be empty!');
        }

        postsService.createPost(author,title, comment,url,image)
            .then(()=>{
                $('#submitForm input[name=url]').val('');
                $('#submitForm input[name=title]').val('');
                $('#submitForm input[name=image]').val('');
                $('#submitForm textarea[name=description]').val('');
                showInfo('Post created.');
                getAllPosts();
                showView('Catalog');
            }).catch(handleError)
    }

    function showEditForm() {
        let postId = $(this).attr('name');
        postsService.getPost(postId)
            .then((postData) => {
                $('#editPostForm input[name=url]').val(postData.url);
                $('#editPostForm input[name=title]').val(postData.title);
                $('#editPostForm input[name=image]').val(postData.imageUrl);
                $('#editPostForm textarea[name=description]').val(postData.description);
                sessionStorage.setItem('postId', postId);
                showView('Edit');
            }).catch(handleError);
    }

    function editPost(ev) {
        ev.preventDefault();
        let postId = sessionStorage.getItem('postId');
        let username = sessionStorage.getItem('username');
        let url = $('#editPostForm input[name=url]').val();
        let title = $('#editPostForm input[name=title]').val();
        let imageUrl = $('#editPostForm input[name=image]').val();
        let description = $('#editPostForm textarea[name=description]').val();

        postsService.editPost(postId,username, title, description, url, imageUrl)
            .then(()=>{
                showInfo(`Post ${title} updated.`);
                getAllPosts();
                showView('Catalog');
            })
    }

    function deletePost() {
        let postId = $(this).attr('name');
        postsService.deletePost(postId)
            .then(()=>{
                showInfo('Post deleted.');
                getAllPosts();
                showView('Catalog');
            }).catch(handleError)
    }
    
    function getMyPosts() {
        postsService.loadAllPosts()
            .then((posts) => {
                posts = posts.filter(p => p.author === sessionStorage.getItem('username'));
                displayMyPosts(posts);
            }).catch(handleError);
    }
    
    function displayMyPosts(posts) {
        let catalog = $('#viewMyPosts');
        catalog.empty();
        let container = $('<div>').addClass('posts');
        let count = 1;

        for (let post of posts) {
            let article = $('<article>').addClass('post');

            let colRank = $('<div>').addClass('col rank');
            colRank.append($(`<span>${count}</span>`));

            let thumbnail = $('<div>').addClass('col thumbnail');
            thumbnail.append($(`<a href="${post.url}"><img src="${post.imageUrl}"</a>`));

            let postContent = $('<div>').addClass('post-content');
            let title = $('<div>').addClass('title');
            title.append($(`<a href="${post.url}">${post.title}</a>`));
            let details = $('<div>').addClass('details');
            details.append($(`<div class="info">submitted ${calcTime(post._kmd.lmt)} ago by ${post.author}</div>`));
            let divControls = $('<div>').addClass('controls');
            let controls = $('<ul>');
            controls.append($(`<li class="action"><a class="commentsLink" name="${post._id}" href="#">comments</a></li>`));
            if(post.author === sessionStorage.getItem('username')){
                controls.append($(`<li class="action"><a class="editLink" name="${post._id}" href="#">edit</a></li>`));
                controls.append($(`<li class="action"><a class="deleteLink" name="${post._id}" href="#">delete</a></li>`));
            }


            divControls.append(controls);
            details.append(divControls);
            postContent.append(title);
            postContent.append(details);

            article.append(colRank);
            article.append(thumbnail);
            article.append(postContent);

            container.append(article);

            count++;
        }
        catalog.append(container);
        catalog.find('.editLink').click(showEditForm);
        catalog.find('.commentsLink').click(getDetails);
        catalog.find('.deleteLink').click(deletePost);
    }

    function getDetails() {
        let postId = $(this).attr('name');
        postsService.getPost(postId)
            .then((postInfo) => {
                commentsService.loadComments(postId)
                    .then((comments) => {
                        displayDetails(postInfo,comments);
                        showView('Comments');
                    }).catch(handleError);
            }).catch(handleError)
    }

    function displayDetails(postInfo, comments) {
        let description = postInfo.description;
        if(description === ''){
            description = 'No description in it’s place.';
        }
        let container = $('#viewComments');
        container.empty();

        let post = $('<div>').addClass('post');

        let thumbnail = $('<div>').addClass('col thumbnail');
        thumbnail.append($(`<a href="${postInfo.url}"><img src="${postInfo.imageUrl}"></a>`));

        let postContent = $('<div>').addClass('post-content');
        let title = $('<div>').addClass('title');
        title.append($(`<a href="${postInfo.url}">${postInfo.title}</a>`));
        let details = $('<div>').addClass('details');
        details.append($(`<p>${description}</p>`));
        details.append($(`<div class="info">submitted ${calcTime(postInfo._kmd.lmt)} ago by ${postInfo.author}</div>`));
        let divControls = $('<div>').addClass('controls');
        let controls = $('<ul>');
        if(post.author === sessionStorage.getItem('username')){
            controls.append($(`<li class="action"><a class="editLink" name="${postInfo._id}" href="#">edit</a></li>`));
            controls.append($(`<li class="action"><a class="deleteLink" name="${postInfo._id}" href="#">delete</a></li>`));
        }

        details.append(divControls);
        postContent.append(title);
        postContent.append(details);
        post.append(thumbnail);
        post.append(postContent);
        post.append($('<div class="clear"></div>'));

        let commentForm =$('<div>').addClass('post post-content');
        let form = $('<form>').attr('id', 'commentForm');
        form.append($('<label>Comment</label>'));
        form.append($('<textarea name="content" type="text"></textarea>'));
        //let input = $('<input>').attr('id', 'btnPostComment');
        //input.attr('name', `${postInfo._id}`);
        //input.attr('type', 'submit');
        //input.val('Add Comment');
        //form.append(input);
        form.append($(`<input type="submit" name="${postInfo._id}" value="Add Comment" id="btnPostComment">`));
        commentForm.append(form);

        container.append(post);
        container.append(commentForm);

        if (comments.length === 0){
            container.find($('.clear')).append($('<p>No comments yet.</p>'))
        } else {
            for (let comment of comments) {
                let article = $('<article>').addClass('post post-content');
                article.append($(`<p>${comment.content}</p>`));
                if(sessionStorage.getItem('username') === comment.author){
                    article.append($(`<div class="info">submitted ${calcTime(comment._kmd.lmt)} ago by ${comment.author} | <a href="#" name= "${comment.postId}" data-id="${comment._id}" class="deleteLink">delete</a></div>`));
                } else {
                    article.append($(`<div class="info">submitted ${calcTime(comment._kmd.lmt)} ago by ${comment.author}</div>`));
                }
                container.append(article);
            }
        }

        container.find('.deleteLink').click(deleteComment);

    }

    function createComment(event) {
        event.preventDefault();
        console.log($(this).attr('name'));
    }

    function deleteComment() {
        console.log('delete');
        let postId = $(this).attr('name').val();
        let commentId = $(this).attr('data-id').val();
        console.log(postId);
        console.log(commentId);
        /*
        commentsService.deleteComment(commentId)
            .then(()=>{
                //todo

            })
            */
    }

    function saveSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authtoken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
        let username = userInfo.username;
        sessionStorage.setItem('username', username);
        let name = userInfo.name;
        sessionStorage.setItem('name', name);

        userLoggedIn();
    }

    if(sessionStorage.getItem('authtoken') === null ){
        userLoggedOut();
    } else{
        userLoggedIn();
    }

    //Register
    function registerUser(ev){
        ev.preventDefault();
        let username = $('#registerForm input[name=username]').val();
        let password = $('#registerForm input[name=password]').val();
        let repeatPass = $('#registerForm input[name=repeatPass]').val();

        let usernamePattern = /^[a-zA-Z]+$/;
        let passwordPattern = /^[a-zA-Z0-9]+$/;
        if(!usernamePattern.test(username)){
            showError('Only letters!');
            return;
        }

        if(username.length < 3){
            showError('Username should be at least 3!');
            return;
        }

        if(!passwordPattern.test(password)){
            showError('Password should content only letters or digits');
            return;
        }

        if(password.length < 6){
            showError('Password must be at least 6 symbols long!');
            return;
        }

        if(password !== repeatPass){
            showError('Passwords are not equal!');
            return;
        }

        auth.register(username, password)
            .then(function (userInfo) {
                saveSession(userInfo);
                $('#registerForm input[name=username]').val('');
                $('#registerForm input[name=password]').val('');
                $('#registerForm input[name=repeatPass]').val('');
                showInfo('User registration successful.');
                showView('Catalog');
            }).catch(handleError)
    }

    //Login
    function loginUser(ev) {
        ev.preventDefault();
        let username = $('#loginForm input[name=username]').val();
        let password = $('#loginForm input[name=password]').val();
        auth.login(username, password)
            .then(function (userInfo) {
                saveSession(userInfo);
                $('#loginForm input[name=username]').val('');
                $('#loginForm input[name=password]').val('');
                showInfo('Login successful.');
                userLoggedIn();
            }).catch(handleError)
    }

    //Logout
    function logoutUser() {
        auth.logout()
            .then(function () {
            sessionStorage.clear();
            showInfo('Logout successful.');
            userLoggedOut();
        }).catch(handleError)
    }

    function calcTime(dateIsoFormat) {
        let diff = new Date - (new Date(dateIsoFormat));
        diff = Math.floor(diff / 60000);
        if (diff < 1) return 'less than a minute';
        if (diff < 60) return diff + ' minute' + pluralize(diff);
        diff = Math.floor(diff / 60);
        if (diff < 24) return diff + ' hour' + pluralize(diff);
        diff = Math.floor(diff / 24);
        if (diff < 30) return diff + ' day' + pluralize(diff);
        diff = Math.floor(diff / 30);
        if (diff < 12) return diff + ' month' + pluralize(diff);
        diff = Math.floor(diff / 12);
        return diff + ' year' + pluralize(diff);
        function pluralize(value) {
            if (value !== 1) return 's';
            else return '';
        }
    }

    function handleError(reason) {
        showError(reason.responseJSON.description);
    }

    //Handle notifications
    function showInfo(message) {
        let infoBox = $('#infoBox');
        infoBox.find('span').text(message);
        infoBox.show();
        setTimeout(() => infoBox.fadeOut(), 3000);
    }

    function showError(message) {
        let errorBox = $('#errorBox');
        errorBox.find('span').text(message);
        errorBox.show();
        setTimeout(() => errorBox.fadeOut(), 3000);
    }

    $(document).on({
        ajaxStart: () => $("#loadingBox").show(),
        ajaxStop: () => $("#loadingBox").fadeOut()
    });

});