import * as Templates from './templates/export.js';

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
export var isLoggedIn = await checkAuth(); // This should be replaced with actual login status check

// Handle browser back and forward buttons
window.onpopstate = () => {
    updateView(window.location.pathname);
};

$(document).ready(async function () {
    // Attach event listeners to navigation links
    $('#home-link').on('click', () => navigate('/'));
    $('#login-link').on('click', () => navigate('/login'));
    $('#register-link').on('click', () => navigate('/register'));
    $('#my-posts-link').on('click', () => navigate('/my-posts'));
    $('#liked-posts-link').on('click', () => navigate('/liked-posts'));
    $('#new-post-link').on('click', () => navigate('/new-post'));
    $('#logout-link').on('click', async () => await logout());

    // Initialize the view
    updateView(window.location.pathname);

});

// Handle navigation
export async function navigate(path) {
    window.history.pushState({}, path, window.location.origin + path);
    updateView(path);
}

// Update the view based on the current path
function updateView(path) {
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

        $('#my-posts-link-container').removeClass('d-none');
        $('#liked-posts-link-container').removeClass('d-none');
        $('#new-post-link-container').removeClass('d-none');
        $('#logout-link-container').removeClass('d-none');

    } else {

        $('#register-link-container').removeClass('d-none');
        $('#login-link-container').removeClass('d-none');

        $('#my-posts-link-container').addClass('d-none');
        $('#liked-posts-link-container').addClass('d-none');
        $('#new-post-link-container').addClass('d-none');
        $('#logout-link-container').addClass('d-none');

    }
}


//would be better if these were in a separate file auth.js
async function checkAuth() {
    fetch('/api/checkAuth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        }
        return response.json();
    }).then(response => {
        isLoggedIn = response.isAuth;
        updateNavbar(isLoggedIn);
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
            debugger;
            showSuccess("Login successful");
            debugger;
            setTimeout(() => {
                history.pushState(null, null, '/');
                updateView('/');
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
        navigate('/');
        updateNavbar(isLoggedIn);
        // hide the user list
        $('#user-col').addClass('d-none');
    }).catch(error => {
        showError(error.message);
    });

}

