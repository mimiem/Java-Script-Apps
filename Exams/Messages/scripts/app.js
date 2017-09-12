$(() => {
    showView('AppHome');

    //Show view one on the time
    function showView(viewName) {
        $('main > section').hide();
        $('#view' + viewName).show();
    }

    //Attach event handlers
    (()=> {
        $('header').find('a[data-target]').click(navigateTo);
        $('#viewRegister').submit(registerUser);
        $('#formLogin').submit(loginUser);
        $('#linkMenuLogout').click(logoutUser);
        $('#linkUserHomeMyMessages').click(()=>{
            showView('MyMessages');
            loadMyMessages();
        });
        $('#linkMenuMyMessages').click(loadMyMessages);
        $('#linkUserHomeArchiveSent').click(()=>{
            showView('ArchiveSent');
            loadArchive();
        });
        $('#linkMenuArchiveSent').click(loadArchive);
        $('#linkUserHomeSendMessage').click(()=>{
            showView('SendMessage');
            loadAllUsers();
        });
        $('#linkMenuSendMessage').click(loadAllUsers);
        $('#formSendMessage').submit(sentMessage);
        $('.notification').click(function () {
            $(this).hide();
        })
    })();

    if(sessionStorage.getItem('authtoken') === null ){
        userLoggedOut();
    } else{
        userLoggedIn();
    }

    function registerUser(ev){
        ev.preventDefault();
        let usernameField = $('#registerUsername');
        let passwordField = $('#registerPasswd');
        let nameField = $('#registerName');
        let username = usernameField.val();
        let password = passwordField.val();
        let name = nameField.val();
        auth.register(username, password, name)
            .then(function (userInfo) {
                saveSession(userInfo);
                usernameField.val('');
                passwordField.val('');
                nameField.val();
                showInfo('User registration successful.');
            }).catch(handleError)
    }

    function loginUser(ev) {
        ev.preventDefault();
        let usernameField = $('#loginUsername');
        let passwordField = $('#loginPasswd');
        let username = usernameField.val();
        let password = passwordField.val();
        auth.login(username, password)
            .then(function (userInfo) {
                saveSession(userInfo);
                usernameField.val('');
                passwordField.val('');
                showInfo('Login successful.');
            }).catch(handleError)
    }

    function logoutUser() {
        auth.logout()
            .then(function () {
            sessionStorage.clear();
            showInfo('Logout successful.');
            userLoggedOut();
        }).catch(handleError)
    }

    function loadMyMessages() {
        let username = sessionStorage.getItem('username');
        messagesService.loadMyMessages(username)
            .then((myMessages) => {
                displayAllMessages(myMessages);
            }).catch(handleError)
    }

    function displayAllMessages(myMessages) {
        let container = $('#myMessages');
        container.empty();
        let table = $('<table>');
        table.append($('<thead>')
            .append($('<tr>')
                .append('<th>From</th>')
                .append('<th>Message</th>')
                .append('<th>Date Received</th>')));

        let body = $('<tbody>');
        for (let message of myMessages) {
            let senderName = message.sender_name;
            let senderUsername = message.sender_username;
            let text = message.text;
            let date = message._kmd.lmt;
            let sender = formatSender(senderName, senderUsername);
            let dateFormat = formatDate(date);
            let tableRow = $('<tr>');
            tableRow.append($('<td>').text(sender));
            tableRow.append($('<td>').text(text));
            tableRow.append($('<td>').text(dateFormat));
            body.append(tableRow);
        }
        table.append(body);
        container.append(table);
    }

    function loadArchive() {
        let username = sessionStorage.getItem('username');
        messagesService.loadSentArchive(username)
            .then((archiveMessages) => {
                displayArchive(archiveMessages);
            }).catch(handleError);
    }

    function displayArchive(archiveMessages) {
        let container = $('#sentMessages');
        container.empty();
        let table = $('<table>');
        table.append($('<thead>')
            .append($('<tr>')
                .append('<th>To</th>')
                .append('<th>Message</th>')
                .append('<th>Date Sent</th>')
                .append('<th>Actions</th>')));

        let body = $('<tbody>');
        for (let message of archiveMessages) {
            let recipient = message.recipient_username;
            let text = message.text;
            let date = message._kmd.lmt;
            let dateFormat = formatDate(date);
            let deleteBtn = $(`<button value="${message._id}">Delete</button>`).click(deleteMessage);
            let tableRow = $('<tr>');
            tableRow.append($('<td>').text(recipient));
            tableRow.append($('<td>').text(text));
            tableRow.append($('<td>').text(dateFormat));
            tableRow.append($("<td>").append(deleteBtn));
            body.append(tableRow);
        }
        table.append(body);
        container.append(table);
    }

    function deleteMessage() {
        let mesId = $(this).val();
        messagesService.deleteMessage(mesId)
            .then(() => {
                showInfo('Message deleted.');
                showView('ArchiveSent');
                loadArchive();
            }).catch(handleError)
    }

    function loadAllUsers() {
        messagesService.loadAllUsers()
            .then((allUsers) => {
                displayUsersInList(allUsers);

            })
    }

    function displayUsersInList(allUsers) {
        let userOptions = $('#msgRecipientUsername');
        let username = sessionStorage.getItem('username');
        userOptions.empty();
        for (let user of allUsers) {
            if(username !== user.username ){
                let formatName = formatSender(user.name, user.username);
                userOptions.append($(`<option value="${user.username}">${formatName}</option>`))
            }
        }
    }

    function sentMessage(ev) {
        ev.preventDefault();
        let username = $('#msgRecipientUsername').val();
        let text = $('#msgText').val();
        let senderName = sessionStorage.getItem('name');
        let senderUsername = sessionStorage.getItem('username');
        messagesService.sendMessage(username,senderName,senderUsername,text)
            .then(() =>{
                showInfo('Message sent.');
                showView('ArchiveSent');
                loadArchive();
            }).catch(handleError);

    }

    function formatDate(dateISO8601) {
        let date = new Date(dateISO8601);
        if (Number.isNaN(date.getDate()))
            return '';
        return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
            "." + date.getFullYear() + ' ' + date.getHours() + ':' +
            padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

        function padZeros(num) {
            return ('0' + num).slice(-2);
        }
    }

    function formatSender(name, username) {
        if (!name)
            return username;
        else
            return username + ' (' + name + ')';
    }

    function navigateTo() {
       let viewName = $(this).attr('data-target');
       showView(viewName);
    }

    function userLoggedIn() {
        $('.anonymous').hide();
        $('.useronly').show();
        let username = sessionStorage.getItem('username');
        $('#spanMenuLoggedInUser').text(`Welcome, ${username}!`);
        $('#viewUserHomeHeading').text(`Welcome, ${username}!`);
        showView('UserHome');
    }

    function userLoggedOut() {
        $('.anonymous').show();
        $('.useronly').hide();
        $('#spanMenuLoggedInUser').text('');
        $('#viewUserHomeHeading').text('');
        showView('AppHome');
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

    function handleError(reason) {
        showError(reason.responseJSON.description);
    }

    function showInfo(message) {
        let infoBox = $('#infoBox');
        infoBox.text(message);
        infoBox.show();
        setTimeout(() => infoBox.fadeOut(), 3000);
    }

    function showError(message) {
        let errorBox = $('#errorBox');
        errorBox.text(message);
        errorBox.show();
        setTimeout(() => errorBox.fadeOut(), 3000);
    }

    //Handle notifications
    $(document).on({
        ajaxStart: () => $("#loadingBox").show(),
        ajaxStop: () => $("#loadingBox").fadeOut()
    });
});