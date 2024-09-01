export function loadOldMessages(data) {
    debugger;
    console.log("Received data:", data);

    // Ensure the `data.messages` exists and is an array
    if (data && Array.isArray(data.messages)) {
        const chatContainer = document.getElementById('chat-messages');
        chatContainer.innerHTML = ''; // Clear existing messages if needed

        data.messages.forEach((messageData, index) => {
            // Debug each message data
            console.log(`Message ${index}:`, messageData);

            const messageElement = createMessageElement({
                From: messageData.username || 'Unknown', // Default to 'Unknown' if username is missing
                Message: messageData.content || 'No content', // Default to 'No content' if message is missing
                CreatedAt: messageData.created_at || null // Default to null if timestamp is missing
            });
            chatContainer.appendChild(messageElement);
        });

        // Scroll to the bottom to show the latest message
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } else {
        console.log("No messages to display or invalid data format.");
    }
}

function createMessageElement({ From, Message, CreatedAt }) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'border', 'rounded', 'p-2', 'text-end');

    const fromDiv = document.createElement('div');
    fromDiv.classList.add('fw-bold', 'text-success');
    fromDiv.textContent = `From: ${From}`;
    messageDiv.appendChild(fromDiv);

    const contentP = document.createElement('p');
    contentP.classList.add('mb-1');
    contentP.textContent = Message;
    messageDiv.appendChild(contentP);

    const timeSpan = document.createElement('span');
    timeSpan.classList.add('message-time', 'small', 'text-muted');
    if (CreatedAt) {
        const date = new Date(CreatedAt);
        timeSpan.textContent = !isNaN(date.getTime()) ? date.toLocaleTimeString() : 'Invalid timestamp';
    } else {
        timeSpan.textContent = 'No timestamp';
    }
    messageDiv.appendChild(timeSpan);

    return messageDiv;
}
