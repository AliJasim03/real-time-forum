import * as UsersList from './templates/user-list.js';
import * as Chat from './templates/chat.js';

export let socket;

export async function setupWebSocket() {
    return new Promise((resolve, reject) => {
        // Initialize the WebSocket connection
        socket = new WebSocket('ws://localhost:8080/events');

        // Handle when the WebSocket connection is opened
        socket.onopen = function (event) {
            UsersList.requestOnlineUsers();
            if(window.location.href.includes('chat')){
                Chat.openChat()
            }
            console.log('Connection opened');
            resolve(socket);  // Resolve the promise when the connection is established
        };

        // Handle incoming messages from the server
        socket.onmessage = function (event) {
            console.log('Message received:', event.data);  // Log raw data received
            const data = JSON.parse(event.data);
            console.log('Parsed message data:', data);  // Log parsed data

            switch (data.type) {
                case 'onlineUsers':
                    UsersList.populateOnlineUserList(data.users);
                    break;
                case 'newOnlineUser':
                    UsersList.updateOnlineUserList(data.user);
                    break;
                case 'offlineUser':
                    UsersList.updateOfflineUser(data.user);
                    break;
                case 'chat':
                    debugger;
                    console.log('Received chat message:', data);
                    Chat.handleChatMessage(data);
                    break;
                case 'oldMessages':
                    Chat.loadOldMessages(data);
                    break;
                case  'chatOpen':
                    Chat.openChat(data);
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
            // Attempt to reconnect after 1 second
            setTimeout(async () => {
                try {
                    await setupWebSocket();
                } catch (error) {
                    console.error('Failed to reconnect:', error);
                }
            }, 1000);
        };

        // Handle WebSocket errors
        socket.onerror = function (error) {
            console.error('WebSocket Error:', error);
            reject(error);  // Reject the promise if there's an error during connection
        };
    });
}




