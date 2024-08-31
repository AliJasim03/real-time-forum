import { updateOnlineUserList } from './templates/user-list.js';
import { loadOldMessages } from './templates/oldMessages.js';
import * as UsersList from './templates/user-list.js';


export let socket;

export function setupWebSocket() {
    socket = new WebSocket('ws://localhost:8080/events');

    // Handle when the WebSocket connection is opened
    socket.onopen = function (event) {
        console.log('Connection opened');
    };

    // Handle incoming messages from the server
    socket.onmessage = function (event) {
        console.log('Message received:', event.data);  // Log raw data received
        const data = JSON.parse(event.data);
        console.log('Parsed message data:', data);  // Log parsed data
        debugger;
        switch (data.type) {
            case 'onlineUsers':
                UsersList.populateOnlineUserList(data.users);
                break;
            case 'newOnlineUser':
                UsersList.updateOnlineUserList(data.user);
                break;
            case 'offlineUser':
                UsersList.updateOfflineUser(data.user);
                break
            case 'chat':
                handleChatMessage(data);
                break;
            case 'oldMessages':
                loadOldMessages(data);
                break;
            case 'error':
                showError(data.message);
                break;
            case 'error':
                showError(data.message);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    };



    // Handle WebSocket connection closure
    socket.onclose = function (event) {
        console.log('Connection closed. Attempting to reconnect...');
        // Attempt to reconnect after 1 second in case of failed attempt ot connect to the server
        setTimeout(setupWebSocket, 1000);
    };

    // Handle WebSocket errors
    socket.onerror = function (error) {
        console.log('Error: ' + error.message);
    };
}

// Function to send a message to the server
function handleChatMessage(data) {
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

function createMessageElement({ FromUserID, Content, CreatedAt }) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'border', 'rounded', 'p-2', 'text-end'); // Add 'text-end' class for right alignment

    const userIDDiv = document.createElement('div');
    userIDDiv.classList.add('fw-bold', 'text-success');
    userIDDiv.textContent = `From: ${FromUserID}`;
    messageDiv.appendChild(userIDDiv);

    const contentP = document.createElement('p');
    contentP.classList.add('mb-1');
    contentP.textContent = Content;
    messageDiv.appendChild(contentP);

    const timeSpan = document.createElement('span');
    timeSpan.classList.add('message-time', 'small', 'text-muted');
    timeSpan.textContent = new Date(CreatedAt).toLocaleTimeString();
    messageDiv.appendChild(timeSpan);

    return messageDiv;
}



