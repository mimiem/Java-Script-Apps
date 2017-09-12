let remote = (() => {
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