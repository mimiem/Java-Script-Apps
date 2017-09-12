let messagesService = (() => {

    function loadMyMessages(username) {
        let endpoint = `messages?query={"recipient_username":"${username}"}`;
        return requester.get('appdata', endpoint, 'kinvey');
    }
    
    function loadSentArchive(username) {
        let endpoint = `messages?query={"sender_username":"${username}"}`;
        return requester.get('appdata', endpoint, "kinvey");
    }

    function deleteMessage(msgId) {
        let endpoint = `messages/${msgId}`;
        return requester.remove('appdata', endpoint, 'kinvey');
    }

    function loadAllUsers() {
        return requester.get('user','', 'kinvey')
    }
    
    function sendMessage(recipientUsername, senderName, senderUsername, text) {
        let messageData = {
            recipient_username: recipientUsername,
            sender_name: senderName,
            sender_username: senderUsername,
            text: text
        };

        return requester.post('appdata', 'messages', 'kinvey', messageData);
    }

    return {
        loadMyMessages,
        loadSentArchive,
        deleteMessage,
        loadAllUsers,
        sendMessage
    }
})();