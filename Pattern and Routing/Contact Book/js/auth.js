let auth = (() => {
    function saveSession(data) {
        localStorage.setItem('username', data.username);
        localStorage.setItem('id', data._id);
        localStorage.setItem('authToken', data._kmd.authtoken);
    }

    function login(username, password) {
        return remote.post('user', 'login', {username: username,password: password},'basic');

    }

    function register(username, password) {
        return remote.post('user', '', {username: username,password: password},'basic');
    }

    function logout() {
        return remote.post('user', '_logout', { authtoken: localStorage.getItem('authToken')});
    }

    return {
        saveSession,
        login,
        register,
        logout
    }
})();