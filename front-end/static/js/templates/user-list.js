import { checkAuth, navigate } from '../app.js';
import {socket} from "../socket.js";

// Update the list of online users in the DOM
export function populateOnlineUserList(users) {
    const userCol = $('#user-col');
    if (!checkAuth()) {
        userCol.addClass('d-none');
        return;
    }
    userCol.removeClass('d-none');

    const userList = $('#user-list');
    userList.html('');

    users.forEach(user => {
        const userItem = document.createElement('li');
        userItem.className = 'list-group-item';

// Create a container to hold the entire user item, allowing for flexible layout
        const userContainer = document.createElement('div');
        userContainer.className = 'd-flex justify-content-between align-items-center';

// Create the username link, which will be underlined by default
        const userLink = document.createElement('a');
        userLink.id = `user-link-${user.ID}`;
        userLink.onclick = () => navigate(`/chat?user=${user.ID}`);
        userLink.style.cursor = 'pointer';
        userLink.className = 'text-decoration-underline'; // Ensure underline for the link
        userLink.textContent = user.Username;

// Create the badges container with appropriate spacing
        const badgesContainer = document.createElement('div');
        badgesContainer.className = 'd-flex align-items-center';

// Create the exclamation mark badge, initially hidden
        const alertBadge = document.createElement('span');
        alertBadge.id = `user-alert-${user.ID}`;
        alertBadge.className = 'badge bg-warning text-dark ms-2 me-2'; // Margin left and right
        alertBadge.textContent = '!';
        alertBadge.style.display = 'none'; // Initially hide the badge

// Create the status badge
        const statusBadge = document.createElement('span');
        statusBadge.className = user.IsOnline ? 'badge bg-success' : 'badge bg-secondary';
        statusBadge.textContent = user.IsOnline ? 'Online' : 'Offline';

// Append the badges to the container
        badgesContainer.appendChild(alertBadge);
        badgesContainer.appendChild(statusBadge);

// Assemble the user item
        userContainer.appendChild(userLink); // Add the username (link) to the container
        userContainer.appendChild(badgesContainer); // Add the badges container to the container
        userItem.appendChild(userContainer); // Add the user container to the list item

// Finally, append the user item to the user list
        userList.append(userItem);



    });

    //check if the user is on the chat page and update the name of the page
    // please forgive me ofr this stupid approach :)
    const username = $('#active-username');
    if (!username.val() && window.location.href.includes('chat')) {
        const userID = window.location.href.split('?')[1].split('=')[1];
        const user = $('#user-link-' + userID).text();
        username.text(user);
    }

}



export function updateOnlineUserList(userId){
    // debugger;
    const userLink = document.getElementById(`user-link-${userId}`);
    if (userLink) {
        userLink.nextElementSibling.textContent = 'Online';
        userLink.nextElementSibling.className = 'badge bg-success';
    }
}
export function updateOfflineUser(userId){
    const userLink = document.getElementById(`user-link-${userId}`);
    if (userLink) {
        userLink.nextElementSibling.textContent = 'Offline';
        userLink.nextElementSibling.className = 'badge bg-secondary';
    }
}


export function requestOnlineUsers() {
    const message = {
        type: 'onlineUsers'
    };
    socket.send(JSON.stringify(message));
}


