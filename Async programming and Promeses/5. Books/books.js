function attachEvents() {
    const baseUrl = 'https://baas.kinvey.com/appdata/kid_Sy337UJv-/books';
    const username = 'mims';
    const password = 'ups';

    $("#loadBtn").click(displayAllBooks);
    $("#addBtn").click(addBook);

    function addBook() {
        let addForm = $("#addForm");
        let data = createBook(addForm);
        cleanFields();

        request(baseUrl, 'POST', data)
            .then(displayAllBooks);
    }

    function displayAllBooks() {
        request(baseUrl, "GET")
            .then(getAllBooks);
    }

    function getAllBooks(data) {
        $("#allBooks").css('display', 'block');
        let table = $('#books');
        table.empty();
        table.append($('<thead id="head">'));
        let headTr = $('<tr>')
            .append($('<th>Title</th>'))
            .append($('<th>Author</th>'))
            .append($('<th>ISBN</th>'))
            .append($('<th>Update</th>'))
            .append($('<th>Delete</th>'));

        $("#head").append(headTr);

        table.append($('<tbody id="body">'));

        for (let element of data) {
            let row = $('<tr>');
            row.attr('data-id', `${element._id}`);

            row.append($(`<td><input type="text" class="title" value="${element.title}"/></td>`))
                .append($(`<td><input type="text" class="author" value="${element.author}"/></td>`))
                .append($(`<td><input type="text" class="isbn" value="${element.isbn}"/></td>`))
                .append($('<td><button>Update</button></td>').click(updateBook))
                .append($('<td><button>Delete</button></td>').click(deleteBook));

            $("#body").append(row);
        }
    }

    function updateBook() {
        let element = $(this).parent();
        let elementId = $(this).parent().attr('data-id');
        let data = createBook(element);

        request(baseUrl+`/${elementId}`, "PUT", data)
            .then(displayAllBooks);
    }

    function deleteBook() {
        let elementId = $(this).parent().attr('data-id');
        request(baseUrl+`/${elementId}`, "DELETE")
            .then(displayAllBooks);
    }

    function cleanFields() {
        let addForm = $("#addForm");
        let title = addForm.find('input.title').val("");
        let author = addForm.find('input.author').val("");
        let isbn = addForm.find('input.isbn').val("");
    }

    function createBook(element) {
        let title = element.find('input.title').val();
        let author = element.find('input.author').val();
        let isbn = element.find('input.isbn').val();


        let data = {
            title: title,
            author: author,
            isbn: isbn
        };

        return data;
    }

    function request(url, method, data) {
        return $.ajax({
            url: url,
            method: method,
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password),
                'Content-type': 'application/json'
            },
            data: JSON.stringify(data)
        });
    }
}