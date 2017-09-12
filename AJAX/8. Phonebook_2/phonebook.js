function attachEvents(){
    $('#btnLoad').click(getContacts);
    $('#btnCreate').click(createContact);

    function createContact() {
        let name = $('#person').val();
        let phone = $('#phone').val();
        let request = {
            url: "https://phonebook-nakov.firebaseio.com/phonebook.json",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                person: name,
                phone: phone
            }),
            success: getContacts,
        };
        $.ajax(request);
        $('#person').val('');
        $('#phone').val('');
    }

    function getContacts() {
        $('#phonebook').empty();
        $.get('https://phonebook-nakov.firebaseio.com/phonebook.json')
            .then(displayContacts);
    }

    function displayContacts(data) {
        let output = $("#phonebook");

        for (let contact in data) {
            let li = $(`<li>${data[contact].person}: ${data[contact].phone}</li>`);
            li.append($('<button>[Delete]</button>').click(()=> deleteContact(contact)));
            output.append(li);
        }

    }

    function deleteContact(contact) {
        let request = {
            url: `https://phonebook-nakov.firebaseio.com/phonebook/${contact}.json`,
            method: "DELETE",
            success: getContacts
        };

        $.ajax(request);
    }
}
