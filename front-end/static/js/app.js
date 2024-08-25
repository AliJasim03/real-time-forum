import * as Templates from './templates/export.js';
import { setupWebSocket } from './socket.js';
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
                //show the user list
                $('#user-col').removeClass('d-none');
                setupWebSocket(); // Call the function to set up the WebSocket connection
                navigate('/'); // Redirect to the home page
                updateNavbar(true);
            }, 2000);
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
        // hide the user list
    }).catch(error => {
        showError(error.message);
    });

}



$(document).ready(async function () {
    // Attach event listeners to navigation links
    $('#home-link').on('click', () => navigate('/'));
    $('#login-link').on('click', () => navigate('/login'));
    $('#register-link').on('click', () => navigate('/register'));
    $('#my-posts-link').on('click', () => navigate('/my-posts'));
    $('#liked-posts-link').on('click', () => navigate('/liked-posts'));
    $('#new-post-link').on('click', () => navigate('/new-post'));
    $('#logout-link').on('click', async () => await logout());

    await checkAuth();
    if (isLoggedIn) {
        // Initialize the view
        updateView(window.location.pathname);
        setupWebSocket(); // Call the function to set up the WebSocket connection
        $('#user-col').removeClass('d-none');
    } else {
        // redirect to login page
        history.pushState(null, null, '/login');
        updateView('/login');
    }
});