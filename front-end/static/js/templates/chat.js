import { socket } from '../socket.js';

var offset = 0;
var currentUsername; // Variable to store the current username

export function chatPage() {
    offset = 0; // when changing chat room reset the offset
    const app = $('#app');
    const userID = window.location.href.split('?')[1].split('=')[1];
    currentUsername = $('#user-link-' + userID).text(); // Store current username
    app.html(`
        <div class="container">
            <div class="card mt-5">
                <div class="card-header text-center">
                    <h2 id="recipient-name">Chat with: <span id="active-username">${currentUsername}</span></h2>
                </div>
                <div class="card-body p-0">
                    <div id="chat-messages" class="p-3 pb-1" style="height: 50vh; overflow-y: auto;"></div>
                    <div class="input-group p-3 pt-0">
                        <input type="text" id="message-input" class="form-control" placeholder="Type your message...">
                        <button class="btn btn-primary" id="send-message">Send</button>
                    </div>
                </div>
            </div>
        </div>
    `);

    const alertBadge = $('#user-alert-' + userID); // Store current username
    if (alertBadge) {
        alertBadge.css('display', 'none'); // Hide the badge
    }

    $('#send-message').on('click', () => sendMessage());
    $('#chat-messages').on('scroll', scrollTop);

    openChat();
}

function scrollTop() {
    const chatContainer = $('#chat-messages');
    if (chatContainer.scrollTop() === 0) {
        console.log("Scrolled to the top!");
        offset += 10;
        // console.log("Offset:", offset);
        const throttledOpenChat = throttle(() => openChat(), 100);
        throttledOpenChat();
    }
}

export function openChat() {
    const userID = window.location.href.split('?')[1].split('=')[1];
    let userId_Parsed = parseInt(userID);

    if (userID === undefined || userID === '' || isNaN(userId_Parsed)) {
        alert('User ID is missing');
        return;
    }

    const opener = { type: 'chatOpen', RecipientID: userId_Parsed, Offset: offset };
    if (socket) {
        socket.send(JSON.stringify(opener));
    } else {
        console.error('Socket is not initialized');
    }
}

function sendMessage() {
    const userID = window.location.href.split('?')[1].split('=')[1];
    const message = $('#message-input').val();
    let senderUser = currentUsername;
    if (userID === undefined || userID === '') {
        alert('User ID is missing');
        return;
    }

    if (message.trim() !== '') {
        let userId_Parsed = parseInt(userID);
        const chatMessage = { type: 'chat', to: userId_Parsed, message: message, username: senderUser};
        yourMessages(message);

        socket.send(JSON.stringify(chatMessage));
        $('#message-input').val('');
    }
}

function yourMessages(message) {
    const now = new Date();
    const time = now.toLocaleTimeString();

    const chatContainer = document.getElementById('chat-messages');
    const messageElement = createMessageElement({
        From: currentUsername,
        Message: message,
        CreatedAt: now.toISOString(), // Use ISO format for consistency
        IsSender: true
    });

    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

export function handleChatMessage(data) {
    debugger;
    console.log("Received data:", data);
    try {
        if (data !== null && typeof data === 'object') {
            console.log(data.from, data.message, data.username);
                // displayNotification(data.from);
                displayNewMessage(data.from, data.message, data.username);
        } else {
            console.error("Invalid message format:", data);
        }
    } catch (error) {
        console.error("Error handling chat message:", error);
    }
}

function displayNewMessage(fromUserID, content, fromUsername) {
    // debugger;

    if ($('#chat-messages')){
        displayNotification(fromUserID);
        return;
    }

        console.log("Displaying message from:", fromUserID);
        const chatContainer = document.getElementById('chat-messages');
        const messageElement = createMessageElement({
            From: fromUsername,
            Message: content,
            CreatedAt: new Date().toISOString(), // Use ISO format for consistency
            IsSender: false
        });

        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
}

function createMessageElement({ From, Message, CreatedAt, IsSender }) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');
    messageDiv.classList.add(IsSender ? 'sender' : 'recipient');

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('message-header');

    if (!IsSender) {
        const fromSpan = document.createElement('span');
        fromSpan.textContent = `From: ${From}`;
        headerDiv.appendChild(fromSpan);
    }

    const timeSpan = document.createElement('span');
    if (CreatedAt) {
        const date = new Date(CreatedAt);
        if (!isNaN(date.getTime())) {
            const formattedDate = date.toLocaleDateString([], {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            });
            const formattedTime = date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });

            timeSpan.textContent = `${formattedDate} ${formattedTime}`;
            timeSpan.classList.add('text-muted', 'small', 'fw-light');

        } else {
            timeSpan.textContent = 'Invalid timestamp';
        }
    } else {
        timeSpan.textContent = 'No timestamp';
    }
    headerDiv.appendChild(timeSpan);

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

    if (data && Array.isArray(data.messages)) {
        const chatContainer = document.getElementById('chat-messages');
        // Save current scroll position from the bottom
        const previousScrollHeight = chatContainer.scrollHeight;
        const fragment = document.createDocumentFragment();
        data.messages.forEach((messageData, index) => {
            console.log(`Message ${index}:`, messageData);
            const messageElement = createMessageElement({
                From: messageData.username || 'Unknown',
                Message: messageData.content || 'No content',
                CreatedAt: messageData.created_at || null, // Ensure this field is properly formatted
                IsSender: messageData.isSender
            });
            fragment.prepend(messageElement); // Prepend old messages to the top
        });

        chatContainer.prepend(fragment);
        chatContainer.scrollTop = chatContainer.scrollHeight - previousScrollHeight;
    } else {
        console.log("No messages to display or invalid data format.");
    }
}


function displayNotification(from) {
    console.log('display nitfication work')
    // alert('You have a new message from ' + from);
    //const userID = window.location.href.split('?')[1].split('=')[1];
     if (from /*!== parseInt(userID)*/) {
        const alertBadge = $('#user-alert-' + from); // Store current username
        alertBadge.css('display', 'inline'); // Use jQuery's css method to change the display property
     }
}

const throttle = (fn, delay) => {
    let lastCall = 0;

    return () => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            fn();
            lastCall = now;
        }
    }
}
