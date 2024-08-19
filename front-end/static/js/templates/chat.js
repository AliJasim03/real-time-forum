export function chatPage(userID) {
    const app = $('#app');
    app.html(`
        <div class="container px-4 px-lg-5">
            <h2 class="text-center mt-5 mb-4">Chat with User ${userID}</h2>
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

    $('#send-message').on('click', () => sendMessage(userID));
    loadChat(userID);
}

function sendMessage(userID) {
    const message = $('#message-input').val();
    if (message.trim() !== '') {
        socket.send(JSON.stringify({ type: 'chat', to: userID, message: message }));
        $('#message-input').val('');
    }
}

//load all previous messges
function loadChat(userID) {
}

