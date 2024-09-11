import * as Templates from './templates/export.js';
import { setupWebSocket, socket } from './socket.js';
// Define routes
const routes = {
    '/': Templates.Index.homePage,
    '/login': Templates.Login.loginPage,
    '/register': Templates.Register.registerPage,
    '/my-posts': Templates.Index.myPostsPage,
    '/liked-posts': Templates.Index.likedPostsPage,
    '/new-post': Templates.createPost.createPostPage,
    '/post': Templates.postDetails.postPage,
    '/chat': Templates.chat.chatPage
};

// Check login status
export let isLoggedIn = false;

// Handle browser back and forward buttons
window.onpopstate = () => {
    updateView(window.location.pathname);
};


// Handle navigation
export async function navigate(path) {
    window.history.pushState({}, path, window.location.origin + path);
    updateView(path);
}


// Update the view based on the current path
export function updateView(path) {

    if (!isLoggedIn && (path !== '/login' && path !== '/register')) {
        history.pushState(null, null, '/login');
        updateView('/login');
        return;
    }
    //remove all the optional query parameters
    path = path.split('?')[0];
    const view = routes[path];
    if (view) {
        view();
    }
}

// Function to update the navbar based on login status
export function updateNavbar(isLoggedIn) {
    if (isLoggedIn) {

        $('#register-link-container').addClass('d-none');
        $('#login-link-container').addClass('d-none');

        $('#home-link').removeClass('d-none');
        $('#my-posts-link-container').removeClass('d-none');
        $('#liked-posts-link-container').removeClass('d-none');
        $('#new-post-link-container').removeClass('d-none');
        $('#logout-link-container').removeClass('d-none');

    } else {
        $('#register-link-container').removeClass('d-none');
        $('#login-link-container').removeClass('d-none');

        $('#home-link').addClass('d-none');
        $('#my-posts-link-container').addClass('d-none');
        $('#liked-posts-link-container').addClass('d-none');
        $('#new-post-link-container').addClass('d-none');
        $('#logout-link-container').addClass('d-none');
    }
}


//would be better if these were in a separate file auth.js
export async function checkAuth() {
    await fetch('/api/checkAuth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        }
        return response.json(); // Parse the response as JSON
    }).then(data => {
        isLoggedIn = data.isAuth;
        updateNavbar(isLoggedIn);
        return isLoggedIn;
    }).catch(error => {
        showError(error);
    });
}


export function loginAction() {
    const email = $('#email').val();
    const password = $('#password').val();

    // Check if the email and password are empty or contain only spaces
    if (email.trim() === "" || password.trim() === "") {
        showError("Email and Password are required");
        return;
    }

    const data = JSON.stringify({
        email: email,
        password: password
    });

    fetch('/api/loginAction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            // Handle successful login
            //show login success message
            showSuccess("Login successful");
            setTimeout(() => {
                isLoggedIn = true;
                navigate('/'); // Redirect to the home page
                updateNavbar(true);
                setupWebSocket(); // Call the function to set up the WebSocket connection
            }, 500);
        })
        .catch(error => {
            showError(error.message);
        });
}

export function registerAction() {

    const firstName = $('#first-name').val().trim();
    const lastName = $('#last-name').val().trim();
    const age = $('#age').val().trim();
    const gender = $('input[name="gender"]:checked').val();
    const email = $('#email').val().trim();
    const username = $('#username').val().trim();
    const password = $('#password').val().trim();

    // Check if there are empty fields or contain only spaces
    if (
        !firstName ||
        !lastName ||
        !age ||
        !gender ||
        !email ||
        !username ||
        !password
    ) {
        showError("Missing required fields");
        return;
    }

    const ageNum = parseInt(age);

    if (!Templates.Register.validationFields(ageNum, email, username, password)) {
        return;
    }

    const data = JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        age: ageNum,
        email: email,
        gender: gender,
        username: username,
        password: password,
    });

    fetch('/api/registerAction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            // Handle successful registration
            showSuccess("Registration successful");
            setTimeout(() => {
                debugger
                isLoggedIn = true;
                navigate('/'); // Redirect to the login page
                updateNavbar(true);
            }, 300);
        })
        .catch(error => {
            showError(error.message);
        });
}


async function logout() {
    fetch('/api/logout', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        }
        //show logout success message
        showSuccess("Logout successful");
        isLoggedIn = false;
        $('#user-col').addClass('d-none');
        navigate('/login');
        Templates.Login.loginPage();
        updateNavbar(false);
        //close the websocket connection
        socket.close();
    }).catch(error => {
        showError(error.message);
    });
}



$(document).ready(async function () {
    // Attach event listeners to navigation links
    $('#home-link').on('click', () => navigate('/'));
    $('#forum-link').on('click', () => navigate('/'));
    $('#login-link').on('click', () => navigate('/login'));
    $('#register-link').on('click', () => navigate('/register'));
    $('#my-posts-link').on('click', () => navigate('/my-posts'));
    $('#liked-posts-link').on('click', () => navigate('/liked-posts'));
    $('#new-post-link').on('click', () => navigate('/new-post'));
    $('#logout-link').on('click', async () => await logout());

    await checkAuth();
    if (isLoggedIn) {
        // Initialize the view
        await setupWebSocket(); // Call the function to set up the WebSocket connection
        updateView(window.location.pathname);
    } else {
        // redirect to login page
        history.pushState(null, null, '/login');
        updateView('/login');
    }
});