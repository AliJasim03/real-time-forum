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
    const userList = document.getElementById('online-users-list');
    userList.innerHTML = '';

    users.forEach(user => {
        const userItem = document.createElement('li');
        userItem.textContent = user;
        userList.appendChild(userItem);
    });
}

$(document).ready(function () {
    setupWebSocket(); // Call the function to set up the WebSocket connection
});


