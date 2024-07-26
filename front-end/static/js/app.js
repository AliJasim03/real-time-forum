import * as Templates from "./templates";

$(document).ready(function () {

    // Define routes
    const routes = {
        '/': homePage,
        '/login': loginPage,
        '/register': registerPage,
        '/my-posts': myPostsPage,
        '/liked-posts': likedPostsPage,
        '/new-post': newPostPage,
        '/create-post': createPostPage,
        '/post-details': postPage
    };

    // Check login status
    const isLoggedIn = false; // This should be replaced with actual login status check

    // Update navbar based on login status
    updateNavbar(isLoggedIn);

    // Attach event listeners to navigation links
    $('#home-link').on('click', () => navigate('/'));
    $('#login-link').on('click', () => navigate('/login'));
    $('#register-link').on('click', () => navigate('/register'));
    $('#my-posts-link').on('click', () => navigate('/my-posts'));
    $('#liked-posts-link').on('click', () => navigate('/liked-posts'));
    $('#new-post-link').on('click', () => navigate('/new-post'));
    $('#logout-link').on('click', () => logout());


    // Handle navigation
    function navigate(path) {
        window.history.pushState({}, path, window.location.origin + path);
        updateView(path);
    }

    // Update the view based on the current path
    function updateView(path) {
        const view = routes[path];
        if (view) {
            $('#app').innerHTML = view();
        }
    }

    // Handle browser back and forward buttons
    window.onpopstate = () => {
        updateView(window.location.pathname);
    };

    // Initialize the view
    updateView(window.location.pathname);
});


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

function homePage() {
    const app = document.getElementById('app');
    app.innerHTML = Templates.index;
    Templates.loadCategories();
    Templates.loadPosts();
}

