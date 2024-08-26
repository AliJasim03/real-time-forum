import { socket } from '../socket.js';
export function chatPage() {
    const app = $('#app');
    app.html(`
        <div class="container px-4 px-lg-5">
            <h2 class="text-center mt-5 mb-4">Chat with: </h2>
            <div class="row">
                <div class="col-md-8">
                    <div id="chat-messages" class="mb-3" style="height: 400px; overflow-y: auto;"></div>
                    <div class="input-group">
                        <input type="text" id="message-input" class="form-control" placeholder="Type your message...">
                        <button class="btn btn-primary" id="send-message">Send</button>
                    </div>
                </div>
            </div>
        </div>
    `);

    $('#send-message').on('click', () => sendMessage());
    // loadChat();
}

function sendMessage() {
    const userID = window.location.href.split('?')[1].split('=')[1];
    const message = $('#message-input').val();
    if (userID === undefined || userID === '') {
        alert('User ID is missing');
        return;
    }
    if (userID === getCurrentUserID()) {
        alert('You cannot chat with yourself');
        return;
    }
    if (message.trim() !== '') {
        const chatMessage = { type: 'chat', to: userID, message: message };
        socket.send(JSON.stringify(chatMessage));
        $('#message-input').val(''); ``
    }
}

function getCurrentUserID() {
    return localStorage.getItem('currID');
}

