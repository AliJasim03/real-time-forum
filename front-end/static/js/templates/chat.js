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
                <div class="card-body p-0">
                    <div id="chat-messages" class="mb-3 p-3" style="height: 50vh; overflow-y: auto;"></div>
                    <div class="input-group p-3">
                        <input type="text" id="message-input" class="form-control" placeholder="Type your message...">
                        <button class="btn btn-primary" id="send-message">Send</button>
                    </div>
                </div>
            </div>
        </div>
    `);

    openChat(offset);
    const throttledOpenChat = throttle(() => openChat(offset), 100);

    $('#send-message').on('click', () => sendMessage());
    $('#chat-messages').on('scroll', () => scrollTop(throttledOpenChat));
}

let offset = 0; //should change
function scrollTop(throttledOpenChat){
    const chatContainer = $('#chat-messages');
    if (chatContainer.scrollTop() === 0) {
        console.log("Scrolled to the top!");
        offset += 10;
        throttledOpenChat();
    }
}

export function openChat(offset) {
    const userID = window.location.href.split('?')[1].split('=')[1];

    //parse the userID to an integer
    let userId_Parsed = parseInt(userID);
    if (userID === undefined || userID === '' || isNaN(userId_Parsed)) {
        alert('User ID is missing');
        return;
    }

    const opener = { type: 'chatOpen', RecipientID: userId_Parsed, Offset: offset};
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
    const randomBoolean = Math.random() >= 0.5;
    const chatContainer = document.getElementById('chat-messages');
    const messageElement = createMessageElement({
        FromUserID: 'HIM',
        Content: content,
        CreatedAt: new Date().toISOString()
    });

    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function createMessageElement({ From, Message, CreatedAt, IsSender }) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('message-header');

    // Add 'recipient' class for recipient messages
    if (!IsSender) {
        messageDiv.classList.add('recipient');

        const fromSpan = document.createElement('span');
        fromSpan.textContent = `From: ${From}`;
        headerDiv.appendChild(fromSpan);
    }

    const timeSpan = document.createElement('span');
    if (CreatedAt) {
        const date = new Date(CreatedAt);
        timeSpan.textContent = !isNaN(date.getTime()) ? date.toLocaleTimeString() : 'Invalid timestamp';
        timeSpan.classList.add('text-muted', 'small');
    } else {
        timeSpan.textContent = 'No timestamp';
    }
    headerDiv.appendChild(timeSpan); // Append time to the right of the header

    messageDiv.appendChild(headerDiv);

    const contentP = document.createElement('div');
    contentP.classList.add('message-body');
    contentP.textContent = Message;
    messageDiv.appendChild(contentP);

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
            const randomBoolean = Math.random() >= 0.5;
            const messageElement = createMessageElement({
                From: messageData.username || 'Unknown', // Default to 'Unknown' if username is missing
                Message: messageData.content || 'No content', // Default to 'No content' if message is missing
                CreatedAt: messageData.created_at || null, // Default to null if timestamp is missing
                IsSender: randomBoolean
            });
            chatContainer.appendChild(messageElement);
        });

        // Scroll to the bottom to show the latest message
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } else {
        console.log("No messages to display or invalid data format.");
    }
}

const throttle = (fn, delay) => {
    let time = Date.now();

    // Here's our logic
    return () => {
      if((time + delay - Date.now()) <= 0) {
        // Run the function we've passed to our throttler,
        // and reset the `time` variable (so we can check again).
        fn();
        time = Date.now();
      }
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