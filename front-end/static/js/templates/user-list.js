import { checkAuth, navigate } from '../app.js';
import { socket } from "../socket.js";

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

    users.sort((a, b) => b.IsOnline - a.IsOnline);
    users.forEach(user => {
        const userItem = document.createElement('li');
        userItem.className = 'list-group-item';
        userItem.id = `user-row-${user.ID}`;

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

        const typingSVG = document.createElement('span');
        typingSVG.id = `user-typing-${user.ID}`;
        typingSVG.style.display = 'none'; // Initially hide the SVG
        typingSVG.style.marginRight = '0.5em';
        typingSVG.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                <circle cx="4" cy="12" r="3" fill="currentColor">
                    <animate id="svgSpinners3DotsBounce0" attributeName="cy" begin="0;svgSpinners3DotsBounce1.end+0.25s" calcMode="spline" dur="0.6s" keySplines=".33,.66,.66,1;.33,0,.66,.33" values="12;6;12"/>
                </circle>
                <circle cx="12" cy="12" r="3" fill="currentColor">
                    <animate attributeName="cy" begin="svgSpinners3DotsBounce0.begin+0.1s" calcMode="spline" dur="0.6s" keySplines=".33,.66,.66,1;.33,0,.66,.33" values="12;6;12"/>
                </circle>
                <circle cx="20" cy="12" r="3" fill="currentColor">
                    <animate id="svgSpinners3DotsBounce1" attributeName="cy" begin="svgSpinners3DotsBounce0.begin+0.2s" calcMode="spline" dur="0.6s" keySplines=".33,.66,.66,1;.33,0,.66,.33" values="12;6;12"/>
                </circle>
            </svg>
        `;

        // Create the exclamation mark badge, initially hidden
        const alertBadge = document.createElement('span');
        alertBadge.id = `user-alert-${user.ID}`;
        alertBadge.className = 'badge bg-warning text-dark ms-2 me-2'; // Margin left and right
        alertBadge.textContent = '!';
        alertBadge.style.display = 'none'; // Initially hide the badge

        // Create the status badge
        const statusBadge = document.createElement('span');
        statusBadge.id = `user-status-${user.ID}`;
        statusBadge.className = user.IsOnline ? 'badge bg-success' : 'badge bg-secondary';
        statusBadge.textContent = user.IsOnline ? 'Online' : 'Offline';

        // Append the badges to the container
        badgesContainer.appendChild(typingSVG);
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



export function updateOnlineUserList(userId) {
    const userLink = document.getElementById(`user-status-${userId}`);
    if (userLink) {
        userLink.textContent = 'Online';
        userLink.className = 'badge bg-success';
        pushMessageTop(userId);
    }
}
export function updateOfflineUser(userId) {
    const userLink = document.getElementById(`user-status-${userId}`);
    if (userLink) {
        userLink.textContent = 'Offline';
        userLink.className = 'badge bg-secondary';
    }
}

export function updateTypingStatus(userId, typing) {
    const alertBadge = document.getElementById(`user-typing-${userId}`);
    if (alertBadge) {
        if (typing) {
            alertBadge.style.display = 'inline';
            pushMessageTop(userId);
        } else {
            alertBadge.style.display = 'none';
        }
    }
}


export function requestOnlineUsers() {
    const message = {
        type: 'onlineUsers'
    };
    socket.send(JSON.stringify(message));
}

export function pushMessageTop(userId) {
    const userRow = document.getElementById(`user-row-${userId}`);
    if (userRow) {
        const parent = userRow.parentNode;
        parent.insertBefore(userRow, parent.firstChild);
    }
}
