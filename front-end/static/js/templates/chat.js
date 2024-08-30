import {socket} from '../socket.js';

export function chatPage() {
    const app = $('#app');
    debugger;
    const userID = window.location.href.split('?')[1].split('=')[1];
    const username = $('#user-link-' + userID).text();
    app.html(`
        <div class="container">
            <div class="card mt-5">
                <div class="card-header text-center">
                    <h2 id="recipient-name">Chat with: ${username}</h2>
                </div>
                <div class="card-body">
                    <div id="chat-messages" class="mb-3" style="height: 50vh; overflow-y: auto;"></div>
                    <div class="input-group">
                        <input type="text" id="message-input" class="form-control" placeholder="Type your message...">
                        <button class="btn btn-primary" id="send-message">Send</button>
                    </div>
                </div>
            </div>
        </div>
    `);

    $('#send-message').on('click', () => sendMessage());
}

function sendMessage() {
    const userID = window.location.href.split('?')[1].split('=')[1];
    const message = $('#message-input').val();
    if (userID === undefined || userID === '') {
        alert('User ID is missing');
        return;
    }
    if (userID === getCurrentUserID()) {
        alert('You cannot chat with yourself');
        return;
    }
    if (message.trim() !== '') {
        let userId_Parsed = parseInt(userID);
        const chatMessage = { type: 'chat', to: userId_Parsed, message: message };
        yourMesssges(message);
        socket.send(JSON.stringify(chatMessage));
        $('#message-input').val('');
    }
}

function yourMesssges(message) {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const myID = 'YOU';
    const yourMessage = message;

    const chatContainer = document.getElementById('chat-messages');
    const messageElement = createMessageElement({
        FromUserID: myID,
        Content: yourMessage,
        CreatedAt: time
    });

    chatContainer.appendChild(messageElement);
}

function createMessageElement({FromUserID, Content, CreatedAt}) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', 'p-3', 'mb-2', 'border', 'rounded');

    const userElement = document.createElement('div');
    userElement.classList.add('message-user', 'font-weight-bold', 'text-primary');
    userElement.textContent = `From: ${FromUserID}`;

    const contentElement = document.createElement('div');
    contentElement.classList.add('message-content');
    contentElement.textContent = Content;

    const timeElement = document.createElement('div');
    timeElement.classList.add('message-time', 'text-muted', 'small');
    timeElement.textContent = CreatedAt;

    messageElement.appendChild(userElement);
    messageElement.appendChild(contentElement);
    messageElement.appendChild(timeElement);

    return messageElement;
}

function getCurrentUserID() {
    return localStorage.getItem('currID');
}

