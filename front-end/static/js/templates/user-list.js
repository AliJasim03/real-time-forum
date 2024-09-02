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

        const userLink = document.createElement('a');
        userLink.onclick = () => navigate(`/chat?user=${user.ID}`);
        userLink.className = 'd-flex justify-content-between align-items-center';

        const username = document.createElement('span');
        username.id = `user-link-${user.ID}`; // Add id property
        username.textContent = user.Username;

        const statusBadge = document.createElement('span');
        statusBadge.className = user.IsOnline ? 'badge bg-success' : 'badge bg-secondary';
        statusBadge.textContent = user.IsOnline ? 'Online' : 'Offline';

        userLink.appendChild(username);
        userLink.appendChild(statusBadge);
        userItem.appendChild(userLink);
        userList.append(userItem);
    });

    //check if the user is on the chat page and update the name of the page
    // please forgive me ofr this stupid approach :)
    debugger;
    const username = $('#active-username');
    if (!username.val()) {
        const userID = window.location.href.split('?')[1].split('=')[1];
        const user = $('#user-link-' + userID).text();
        username.text(user);
    }

}



export function updateOnlineUserList(userId){
    debugger;
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


