import * as Templates from './templates/export.js';

// Define routes
const routes = {
    '/': Templates.Index.homePage,
    '/login': Templates.Login.loginPage,
    '/register': Templates.register.registerPage,
    //'/my-posts': myPostsPage,
    // '/liked-posts': likedPostsPage,
    '/new-post': Templates.createPost.createPostPage,
    '/create-post': Templates.createPostPage,
    '/post-details': Templates.postPage
};

// Check login status
var isLoggedIn = await checkAuth(); // This should be replaced with actual login status check


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

// Handle browser back and forward buttons
window.onpopstate = () => {
    updateView(window.location.pathname);
};

// Function to update the navbar based on login status
function updateNavbar(isLoggedIn) {
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

    await checkAuth();

});

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

async function logout() {
    debugger;
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
        updateNavbar(isLoggedIn);
    }).catch(error => {
        showError(error.message);
    });

}

