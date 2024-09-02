import { socket } from '../socket.js';

export function chatPage() {
    const app = $('#app');
    const userID = window.location.href.split('?')[1].split('=')[1];
    const username = $('#user-link-' + userID).text();
    app.html(`
        <div class="container">
            <div class="card mt-5">
                <div class="card-header text-center">
                    <h2 id="recipient-name">Chat with: <span id="active-username">${username}</span></h2>
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

    openChat();

    $('#send-message').on('click', () => sendMessage());
}

export function openChat() {
    const userID = window.location.href.split('?')[1].split('=')[1];

    //parse the userID to an integer
    let userId_Parsed = parseInt(userID);
    if (userID === undefined || userID === '' || isNaN(userId_Parsed)) {
        alert('User ID is missing');
        return;
    }
    const opener = { type: 'chatOpen', RecipientID: userId_Parsed};
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

    if (message.trim() !== '') {
        let userId_Parsed = parseInt(userID);
        const chatMessage = { type: 'chat', to: userId_Parsed, message: message };
        yourMessages(message);
        socket.send(JSON.stringify(chatMessage));
        $('#message-input').val('');
    }
}

function yourMessages(message) {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const myID = 'YOU';
    const yourMessage = message;

    const chatContainer = document.getElementById('chat-messages');
    const messageElement = createMessageElement({
        From: myID,
        Message: yourMessage,
        CreatedAt: time
    });

    chatContainer.appendChild(messageElement);
}


// Function to send a message to the server
export function handleChatMessage(data) {
    try {
        if (data !== null && typeof data === 'object') {
            displayNewMessage(data.from, data.message, data.Username);
        } else {
            console.error("Invalid message format:", data);
        }
    } catch (error) {
        console.error("Error handling chat message:", error);
    }
}

function displayNewMessage(fromUserID, content) {
    console.log("Displaying message from:", fromUserID);
    const chatContainer = document.getElementById('chat-messages');
    const messageElement = createMessageElement({
        FromUserID: 'HIM',
        Content: content,
        CreatedAt: new Date().toISOString()
    });

    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function createMessageElement({ From, Message, CreatedAt }) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'border', 'rounded', 'p-2', 'text-end');

    const fromDiv = document.createElement('div');
    fromDiv.classList.add('fw-bold', 'text-success');
    fromDiv.textContent = `From: ${From}`;
    messageDiv.appendChild(fromDiv);

    const contentP = document.createElement('p');
    contentP.classList.add('mb-1');
    contentP.textContent = Message;
    messageDiv.appendChild(contentP);

    const timeSpan = document.createElement('span');
    timeSpan.classList.add('message-time', 'small', 'text-muted');
    if (CreatedAt) {
        const date = new Date(CreatedAt);
        timeSpan.textContent = !isNaN(date.getTime()) ? date.toLocaleTimeString() : 'Invalid timestamp';
    } else {
        timeSpan.textContent = 'No timestamp';
    }
    messageDiv.appendChild(timeSpan);

    return messageDiv;
}


export function loadOldMessages(data) {
    debugger;
    console.log("Received data:", data);

    // Ensure the `data.messages` exists and is an array
    if (data && Array.isArray(data.messages)) {
        const chatContainer = document.getElementById('chat-messages');
        chatContainer.innerHTML = ''; // Clear existing messages if needed

        data.messages.forEach((messageData, index) => {
            // Debug each message data
            console.log(`Message ${index}:`, messageData);

            const messageElement = createMessageElement({
                From: messageData.username || 'Unknown', // Default to 'Unknown' if username is missing
                Message: messageData.content || 'No content', // Default to 'No content' if message is missing
                CreatedAt: messageData.created_at || null // Default to null if timestamp is missing
            });
            chatContainer.appendChild(messageElement);
        });

        // Scroll to the bottom to show the latest message
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } else {
        console.log("No messages to display or invalid data format.");
    }
}



/*function createMessageElement({ FromUserID, Content, CreatedAt }) {
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
}*/