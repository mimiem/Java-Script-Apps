function attachEvents(){
    $("#submit").click(submitRecord);
    $("#refresh").click(refreshData);

    function submitRecord() {
        let author = $('#author').val();
        let content = $('#content').val();

        let request = {
            url: 'https://messanger-624f8.firebaseio.com/messenger/.json',
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                author: author,
                content: content,
                timestamp: Date.now()}),
            success: refreshData
        };

        $.ajax(request);
    }

    function refreshData() {
        $.get('https://messanger-624f8.firebaseio.com/messenger/.json')
            .then(displayAll);
    }

    function displayAll(data) {
        let output = $("#messages");
        let messageBox = '';
        for (let record in data) {
            messageBox += `${data[record].author}: ${data[record].content}\n`;
        }

        output.text(messageBox);
    }
}