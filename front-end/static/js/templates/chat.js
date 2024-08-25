import { socket } from '../socket.js';
export function chatPage(userID) {
    const app = $('#app');
    app.html(`
        <div class="container px-4 px-lg-5">
            <h2 class="text-center mt-5 mb-4">Chat with: </h2>
            <div class="row">
                <div class="col-md-8">
                    <div id="chat-messages" class="mb-3" style="height: 400px; overflow-y: auto;"></div>
                    <div class="input-group">
                        <input type="text" id="message-input" class="form-control" placeholder="Type your message...">
                        <button class="btn btn-primary" id="send-message">Send</button>
                    </div>
                </div>
            </div>
        </div>
    `);

    $('#send-message').on('click', () => sendMessage());
    // loadChat();
}

function sendMessage() {
    const userID = window.location.href.split('?')[1].split('=')[1];
    console.log(userID); // Will log the user ID from the current URL
    console.log("it work in front");
    const message = $('#message-input').val();
    if (message.trim() !== '') {
        console.log(message);
        debugger;
        const chatMessage = { type: 'chat', to: userID, message: message };
        socket.send(JSON.stringify(chatMessage));
        console.log(chatMessage);
        $('#message-input').val(''); ``
    }
}

function getCurrentUserID() {
    return localStorage.getItem('currID');
}


//load all previous messges
/*function loadChat(userID) {
    const currentUserID = getCurrentUserID(); // Implement this function to get the current user's ID
    const url = `/api/getMessges?user1=${currentUserID}&user2=${userID}&limit=10`;

    fetch(url)
        .then(response => response.json())
        .then(messages => {
            displayMessages(messages);
        })
        .catch(error => {
            console.error('Error loading chat messages:', error);
        });
}

function displayMessages(messages) {
    const chatContainer = document.getElementById('chat-messages');
    chatContainer.innerHTML = ''; // Clear existing messages

    if (messages && Array.isArray(messages)) {
        messages.forEach(message => {
            const messageElement = createMessageElement(message);
            chatContainer.appendChild(messageElement);
        });
    }

    // Scroll to the bottom of the chat container
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(message.FromUserID === getCurrentUserID() ? 'sent' : 'received');

    const contentP = document.createElement('p');
    contentP.textContent = message.Content;

    const timeSpan = document.createElement('span');
    timeSpan.classList.add('message-time');
    timeSpan.textContent = new Date(message.CreatedAt).toLocaleTimeString();

    messageDiv.appendChild(contentP);
    messageDiv.appendChild(timeSpan);

    return messageDiv;
}*/




