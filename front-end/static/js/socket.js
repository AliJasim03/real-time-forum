import { updateOnlineUserList } from './templates/user-list.js';

let socket;

export function setupWebSocket() {
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
                break;
            case 'onlineUsers':
                debugger;
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



async function checkAuth() {
    fetch('/api/checkAuth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        }
        return response.json();
    }).then(response => {
        isLoggedIn = response.isAuth;
        updateNavbar(isLoggedIn);
    }).catch(error => {
        showError(error);
    });
}

function getCurrentUserID() {
    return localStorage.getItem('currID');
}

// Function to send a message to the server
function handleChatMessage(message) {
    try {
        if (typeof message === 'object'){
            displayNewMessage(message.from, message.content);
        } else {
            console.error("Invalid message format:", message);
        }
    } catch (error) {
        console.error("Error handling chat message:", error);
    }
}



function displayNewMessage(fromUserID, content) {
    console.log("Displaying message from:", fromUserID);
    const chatContainer = document.getElementById('chat-messages');
    const messageElement = createMessageElement({
        FromUserID: fromUserID,
        Content: content,
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

// Update the list of online users in the DOM
function updateOnlineUserList(users) {
    const userList = document.querySelector('.list-group');
    userList.innerHTML = '';

    if (!checkAuth()) {
        userList.style.display = 'none';
        return;
    } else {
        userList.style.display = 'block';
    }

    users.forEach(user => {
        const userItem = document.createElement('li');
        userItem.className = 'list-group-item';

        const userLink = document.createElement('a');
        userLink.href = `/chat?user=${user.ID}`;
        userLink.className = 'd-flex justify-content-between align-items-center';
        userLink.textContent = user.Username;

        const statusBadge = document.createElement('span');
        statusBadge.className = user.IsOnline ? 'badge bg-success' : 'badge bg-secondary';
        statusBadge.textContent = user.IsOnline ? 'Online' : 'Offline';

        userLink.appendChild(statusBadge);
        userItem.appendChild(userLink);
        userList.appendChild(userItem);
    });
}

$(document).ready(function () {
    setupWebSocket(); // Call the function to set up the WebSocket connection
});
