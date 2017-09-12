function attachEvents() {
    $("#btnLoadPosts").click(loadAllPosts);
    $("#btnViewPost").click(viewPost);

    const baseUrl = 'https://baas.kinvey.com/appdata/kid_rk0irv5UW/';
    const username = 'peter';
    const password = 'p';
    let select = $('#posts');

    function request(endUrl) {
        return $.ajax({
            url: baseUrl + endUrl,
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            }
        });
    }

    function loadAllPosts() {
        request('posts')
            .then(displayPosts)
            .catch(displayError);

        function displayPosts(data) {
            select.empty();
            for (let post of data) {
                $('<option>')
                    .text(post.title)
                    .val(post._id)
                    .appendTo(select);
            }
        }
    }

    function viewPost() {
        let postID = select.find('option:selected').val();

        let postP = request(`posts/${postID}`);
        let commentsP = request(`comments/?query={"postId":"${postID}"}`);
        Promise.all([postP,commentsP])
            .then(displayPostInfo)
            .catch(displayError);
        
        function displayPostInfo([data,comments]) {
            let postTitle = $("#post-title");
            let postBody = $("#post-body");
            let postComments = $("#post-comments");
            postTitle.empty();
            postTitle.text(data.title);
            postBody.empty();
            postBody.append($(`<li>${data.body}</li>`));
            postComments.empty();

            if (comments.length === 0){
                postComments.append($(`<li><i>No comments yet</i></li>`))
            }

            for (let comment of comments) {
                postComments.append($(`<li>${comment.text}</li>`))
            }

        }

    }

    function displayError(err) {
        console.log(err.statusText);
    }
}
