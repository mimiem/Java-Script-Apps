let commentsService = (() => {
    function loadComments(postId) {
        let endPoint = `comments?query={"postId":"${postId}"}&sort={"_kmd.ect": -1}`;
        return requester.get('appdata', endPoint, 'kinvey');
    }
    
    function createComment(postId, author, content) {
        let commentData = {
            postId,
            author,
            content
        };
        return requester.post('appdata', 'comments', 'kinvey', commentData);
    }

    function deleteComment(commentsId) {
        let endPoint = `comments/${commentsId}`;
        return requester.remove('appdata', endPoint, 'kinvey');
    }

    return {
        loadComments,
        createComment,
        deleteComment
    }
})();