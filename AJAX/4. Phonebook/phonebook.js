$(function () {
   $('#btnCreate').click(createContact);
    const phones = $("#phonebook");

    loadContacts();

    function createContact() {
       let name = $("#person").val();
       let phone = $("#phone").val();

       if (name.length === 0){
           notify("Name cannot be empty", 'error');
           return;
       }

        if (phone.length === 0){
            notify("Phone cannot be empty", 'error');
            return;
        }

        $('#btnCreate').prop("disabled", true);

        let request = {
           url: "https://phonebook-bc0a2.firebaseio.com/phonebook.json",
           method: "POST",
           contentType: "application/json",
           data: JSON.stringify({
               person: name,
               phone: phone
           }),
           success: ()=> {
               $("#person").val("");
               $("#phone").val("");
               notify("Created", 'info');
               loadContacts()
               },
           error: displayError,
           complete: () => $('#btnCreate').prop("disabled", false)
       };
       $.ajax(request);


   }

   function loadContacts() {
       phones.empty();
       let request = {
           url: "https://phonebook-bc0a2.firebaseio.com/phonebook.json",
           method: "GET",
           success: display,
           error: displayError
       };

       $.ajax(request);
   }

    function displayError(err) {
        notify('Error: ' + err.statusText, 'error');
    }

    function display(contacts) {
        for (let contact in contacts) {
            let html = $(`<li><span>${contacts[contact].person}: ${contacts[contact].phone}</span></li>`);
            html.append($('<button>Delete</button>').click(() => deleteContact(contact)));
            phones.append(html);
        }

    }

    function deleteContact(contact) {
        let request = {
            url: `https://phonebook-bc0a2.firebaseio.com/phonebook/${contact}.json`,
            method: "DELETE",
            success: () => { notify("Deleted", 'info'); loadContacts()},
            error: displayError
        };

        $.ajax(request);
    }

    function notify(message, type) {
        let notification = $('#notification');
        notification.text(message);
        notification.css('display', 'block');
        setTimeout(() => notification.css('display','none'),2000);

        switch (type){
            case 'error': notification.css('background','#991111'); break;
            case 'info': notification.css('background','#111199'); break;
            case 'success': notification.css('background','#119911'); break;

        }
    }
});