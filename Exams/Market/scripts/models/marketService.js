let marketService = (() => {
    function loadAllProducts() {
        return requester.get('appdata', 'products', 'kinvey');
    }

    function getUser(id) {
        return requester.get('user', id, 'kinvey')
    }

    function getProduct(id) {
        let endpoint = `products/${id}`;
        return requester.get('appdata', endpoint, 'kinvey');
    }
    
    function updateUser(id, username, name, cart) {
        let userData = {
            username,
            name,
            cart
        };

        return requester.update('user', id, 'kinvey', userData);
    }

    return {
        loadAllProducts,
        getUser,
        updateUser,
        getProduct
    }
})();