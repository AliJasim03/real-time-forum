import { socket } from '../socket.js';
export function chatPage() {
    const app = $('#app');
    app.html(`
        <div class="container px-4 px-lg-5">
            <h2 class="text-center mt-5 mb-4">Chat with: </h2>
            <div class="row">
                <div class="col-md-8">
                    <div id="chat-messages" class="mb-3" style="height: 400px; overflow-y: scroll;"></div>
                    <div class="input-group">
                        <input type="text" id="message-input" class="form-control" placeholder="Type your message...">
                        <button class="btn btn-primary" id="send-message">Send</button>
                    </div>
                </div>
            </div>
        </div>
    `);

     openChat();

    $('#send-message').on('click', () => sendMessage());
}

export function openChat() {
    console.log('Socket:', socket); // Check if socket is undefined

    const userID = window.location.href.split('?')[1].split('=')[1];

    if (userID === getCurrentUserID()) {
        console.error('You cannot chat with yourself');
        return;
    }

    const opener = { type: 'chatOpen', userID1: userID, userID2: getCurrentUserID(), message: 'open' };
    console.log(opener);
    if (socket) {
        socket.send(JSON.stringify(opener));
    } else {
        console.error('Socket is not initialized');
    }
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
        const chatMessage = { type: 'chat', to: userID, message: message };
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

function createMessageElement({ FromUserID, Content, CreatedAt }) {
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

