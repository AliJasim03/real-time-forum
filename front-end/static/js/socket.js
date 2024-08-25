import { updateOnlineUserList } from './templates/user-list.js';

let socket;

function setupWebSocket() {
    socket = new WebSocket('ws://localhost:8080/events');

    // Handle when the WebSocket connection is opened
    socket.onopen = function (event) {
        console.log('Connection opened');
        //TODO: Send a message to the server to get the list of online users
    };

    // Handle incoming messages from the server
    socket.onmessage = function (event) {
        console.log('Message received:', event.data);  // Log raw data received
        const data = JSON.parse(event.data);
        console.log('Parsed message data:', data);  // Log parsed data

        switch (data.type) {
            case 'initialConnection':
                localStorage.setItem('currID', data.userID);
            case 'onlineUsers':
                updateOnlineUserList(data.users);
                break;
            case 'chat':
                handleChatMessage(data.message);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    };



    // Handle WebSocket connection closure
    socket.onclose = function (event) {
        console.log('Connection closed. Attempting to reconnect...');
        // updateNavbar(isLoggedIn);
        // Attempt to reconnect after 1 second in case of failed attempt ot connnect to the server
        setTimeout(setupWebSocket, 1000);
    };

    // Handle WebSocket errors
    socket.onerror = function (error) {
        console.log('Error: ' + error.message);
    };
}


function getCurrentUserID() {
    return localStorage.getItem('currID');
}

// Function to send a message to the server
function handleChatMessage(data) {
    console.log("Received message:", data);
    console.log('l getttttt the messge but not visible', data.message);
    displayNewMessage(data.from, data.message);
}

function displayNewMessage(fromUserID, message) {
    console.log(message);
    const chatContainer = document.getElementById('chat-messages');
    const messageElement = createMessageElement({
        FromUserID: fromUserID,
        Content: message,
        CreatedAt: new Date().toISOString()
    });
    chatContainer.appendChild(messageElement);
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
}



$(document).ready(function () {
    setupWebSocket(); // Call the function to set up the WebSocket connection
});


