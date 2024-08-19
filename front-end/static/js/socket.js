let socket;
// import { isLoggedIn } from "./app";

function setupWebSocket() {
    socket = new WebSocket('ws://localhost:8080/events');

    // Handle when the WebSocket connection is opened
    socket.onopen = function (event) {
        console.log('Connection opened');
        //TODO: Send a message to the server to get the list of online users
    };

    // Handle incoming messages from the server
    socket.onmessage = function (event) {
        console.log('Message from server: ' + event.data);

        const data = JSON.parse(event.data);
        //TODO: change to switch statement
        if (data.type === 'onlineUsers') {
            updateOnlineUserList(data.users);
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

// Function to send a message to the server
function sendMessage() {
    const message = 'Hello, Server!';
    socket.send(message);
    console.log('Sent: ' + message);
}

// Update the list of online users in the DOM
function updateOnlineUserList(users) {
    const userList = document.querySelector('.list-group');
    userList.innerHTML = '';

/*  l Don't know why dosn't work this part
    if (!isLoggedIn) {
        userList.style.display = 'none';
        return; 
    } else {
        userList.style.display = 'block'; 
    }
*/
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


