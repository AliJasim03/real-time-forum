import * as UsersList from './templates/user-list.js';
import * as Chat from './templates/chat.js';


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
                Chat.loadOldMessages(data);
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




