let postsService = (() => {
    function loadAllPosts() {
        return requester.get('appdata', 'posts?query={}&sort={"_kmd.ect": -1}', 'kinvey');
    }

    function createPost(author, title, description, url, imageUrl) {
        let postData = {
            author,
            title,
            description,
            url,
            imageUrl
        };

        return requester.post('appdata','posts','kinvey', postData);
    }

    function getPost(id) {
        let endPoint = `posts/${id}`;
        return requester.get('appdata', endPoint, 'kinvey');
    }
    
    function editPost(id, author, title, description, url, imageUrl) {
        let postData = {
            author,
            title,
            description,
            url,
            imageUrl
        };

        let endPoint = `posts/${id}`;
        return requester.update('appdata',endPoint,'kinvey', postData);
    }
    
    function deletePost(id) {
        let endPoint = `posts/${id}`;
        return requester.remove('appdata', endPoint, 'kinvey');
    }
    
    function loadMyPosts(username) {
        let endPoint = `posts?query={"author":"${username}"}&sort={"_kmd.ect": -1}`;
        return requester.get('apdata', endPoint, 'kinvey');
    }
    
    function loadPostDetails() {
        //ToDO
    }

    return {
        loadAllPosts,
        getPost,
        createPost,
        editPost,
        deletePost,
        loadMyPosts
    }
})();