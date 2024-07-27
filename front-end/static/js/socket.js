const socket = new WebSocket('ws://localhost:8080/events');

socket.onopen = function(event) {
    console.log('Connection opened');
};

socket.onmessage = function(event) {
    console.log('Message from server: ' + event.data);

    const e = JSON.parse(event.data);

    if (e.type == 'ping') {
        console.log("Received ping from server with value: " + e.count)
    }
};

socket.onclose = function(event) {
    console.log('Connection closed');
};

socket.onerror = function(error) {
    console.log('Error: ' + error.message);
};

function sendMessage() {
    const message = 'Hello, Server!';
    socket.send(message);
    console.log('Sent: ' + message);
}

