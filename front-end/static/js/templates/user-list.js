import { checkAuth, navigate } from '../app.js';

// Update the list of online users in the DOM
export function updateOnlineUserList(users) {
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
        userLink.textContent = user.Username;

        const statusBadge = document.createElement('span');
        statusBadge.className = user.IsOnline ? 'badge bg-success' : 'badge bg-secondary';
        statusBadge.textContent = user.IsOnline ? 'Online' : 'Offline';

        userLink.appendChild(statusBadge);
        userItem.appendChild(userLink);
        userList.append(userItem);
    });
}

