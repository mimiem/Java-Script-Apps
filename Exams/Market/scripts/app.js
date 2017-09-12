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
        $('#linkMenuShop').click(()=>{
            showView('Shop');
            loadAllProducts();
        });
        $('#linkUserHomeShop').click(()=>{
            showView('Shop');
            loadAllProducts();
        });
        $('#linkMenuCart').click(()=>{
            showView('Cart');
            loadCart();
        });
        $('#linkUserHomeCart').click(()=>{
            showView('Cart');
            loadCart();
        });

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
        let cart = {};
        auth.register(username, password, name, cart)
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

    function loadAllProducts() {
        marketService.loadAllProducts()
            .then((allProducts) => {
                displayProducts(allProducts);
            }).catch(handleError)
    }

    function displayProducts(allProducts) {
        let container = $('#shopProducts');
        container.empty();
        let table = $('<table>');
        table.append($('<thead>')
            .append($('<tr>')
                .append('<th>Product</th>')
                .append('<th>Description</th>')
                .append('<th>Price</th>')
                .append('<th>Actions</th>')));
        let body = $('<tbody>');
        for (let product of allProducts) {
            let name = product.name;
            let description = product.description;
            let price = product.price;
            let purchaseBtn = $(`<button value="${product._id}">Purchase</button>`).click(purchaseProduct);
            let tableRow = $('<tr>');
            tableRow.append($('<td>').text(name));
            tableRow.append($('<td>').text(description));
            tableRow.append($('<td>').text(roundPrice(price)));
            tableRow.append($('<td>').append(purchaseBtn));
            body.append(tableRow);
        }
        table.append(body);
        container.append(table);
    }

    function purchaseProduct() {
        let id = sessionStorage.getItem('userId');
        let productId = $(this).val();

        marketService.getUser(id)
            .then((userData) => {
                updatePurchaseUser(productId, userData);
                showInfo('Product purchased.');
            }).catch(handleError);
    }

    function updatePurchaseUser(productId, userData) {
        let id = sessionStorage.getItem('userId');
        let name = userData.name;
        let username = userData.username;
        let cart = userData.cart;
        let productQuantity;

        if(userData.cart[productId] === undefined || userData.cart[productId] === null){
            productQuantity = 1;
        } else {
            productQuantity = Number(userData.cart[productId]['quantity']);
            productQuantity++;
        }

        marketService.getProduct(productId)
            .then((productData) => {
                cart[productId] = {
                  quantity: productQuantity,
                  product: {
                      name: productData.name,
                      description: productData.description,
                      price: productData.price
                  }
                };
                marketService.updateUser(id,username,name,cart)
                    .then(() => {
                        showView('Cart');
                        loadCart();
                    }).catch(handleError)
            }).catch(handleError);

    }

    function roundPrice(value) {
        let power = Math.pow(10, 2);
        let absValue = Math.abs(Math.round(value * power));
        let result = (value < 0 ? '-' : '') + String(Math.floor(absValue / power));
        let fraction = String(absValue % power);
        let padding = new Array(Math.max(2 - fraction.length, 0) + 1).join('0');
        result += '.' + padding + fraction;

        return result;
    }

    function loadCart() {
        let id = sessionStorage.getItem('userId');
        marketService.getUser(id)
            .then((userData)=>{
                displayCart(userData);
            }).catch(handleError);
    }

    function displayCart(userData) {

        let container = $('#cartProducts');
        container.empty();
        let table = $('<table>');
        table.append($('<thead>')
            .append($('<tr>')
                .append('<th>Product</th>')
                .append('<th>Description</th>')
                .append('<th>Quantity</th>')
                .append('<th>Total Price</th>')
                .append('<th>Actions</th>')));

        let body = $('<tbody>');
        for (let product in userData.cart) {
            if (userData.cart.hasOwnProperty(product)) {
                let cart = userData.cart[product];
                let name = cart.product['name'];
                let description = cart.product['description'];
                let quantity = cart['quantity'];
                let price = cart.product['price'];
                let totalPrice = price * quantity;
                let discardBtn = $(`<button value="${product}">Discard</button>`).click(discardProduct);
                let tableRow = $('<tr>');
                tableRow.append($('<td>').text(name));
                tableRow.append($('<td>').text(description));
                tableRow.append($('<td>').text(quantity));
                tableRow.append($('<td>').text(roundPrice(totalPrice)));
                tableRow.append($('<td>').append(discardBtn));
                body.append(tableRow);
            }
        }

        table.append(body);
        container.append(table);
    }

    function discardProduct() {
        let productId = $(this).val();
        let id = sessionStorage.getItem('userId');
        marketService.getUser(id)
            .then((userData) => {
                updateDiscardUser(productId, userData);
                showInfo('Product discarded.');
            }).catch(handleError);
    }

    function updateDiscardUser(productId, userData) {

        let id = sessionStorage.getItem('userId');
        let name = userData.name;
        let username = userData.username;
        let cart = userData.cart;
        userData.cart[productId] = undefined;

        marketService.updateUser(id,username,name,cart)
            .then(() => {
                showView('Cart');
                loadCart();
            }).catch(handleError)

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