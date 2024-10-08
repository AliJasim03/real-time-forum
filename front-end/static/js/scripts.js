function likeDislikePost(postID, isLike) {
    event.preventDefault(); // Prevent the default form submission
    $.ajax({
        url: "/api/likeOrDislikePost",
        type: "POST",
        data: JSON.stringify({
            ID: postID,
            isLike: isLike
        }),
        contentType: "application/json",
        success: function (response) { //data is returnin as string
            // Assuming the server response contains the updated like/dislike status
            // data should include fields like data.isLiked and data.isDisliked
            // data should include fields like data.isLiked and data.isDisliked
            const likeBtn = $('#like-btn-' + postID);
            const dislikeBtn = $('#dislike-btn-' + postID);

            if (response === "liked") {
                likeBtn.addClass('custom-hover-like');
                dislikeBtn.removeClass('custom-hover-dislike');
            } else if (response === "disliked") {
                likeBtn.removeClass('custom-hover-like');
                dislikeBtn.addClass('custom-hover-dislike');
            } else {
                likeBtn.removeClass('custom-hover-like');
                dislikeBtn.removeClass('custom-hover-dislike');
            }
            updateCounters(postID);
        },
        error: function (response) {
            showError(response.responseText);
        }
    });
}

function updateCounters(postID) {
    $.ajax({
        url: "/api/getPostLikesAndDislikesCount",
        type: "POST",
        data: JSON.stringify({
            ID: postID
        }),
        contentType: "application/json",
        success: function (data) {
            $('#like-count-' + postID).text(data.likes);
            $('#dislike-count-' + postID).text(data.dislikes);
        },
        error: function (data) {
            alert(data.responseText);
        }
    });
}

$(document).ready(function () {
    // Map of IDs to routes
    const idToRoute = {
        'home-link': '/',
        'login-link': '/login',
        'register-link': '/register',
        'new-post-link': '/new-post',
        'my-posts-link': '/my-posts',
        'liked-posts-link': '/liked-posts',
    };

    // Function to update the active class based on the current path
    function updateActiveClass() {
        var currentPath = window.location.pathname;

        // Iterate over each nav-link element
        $('.nav-link').each(function () {
            // Get the id attribute
            var id = $(this).attr('id');

            // Check if the id matches the currentPath
            if (idToRoute[id] === currentPath) {
                // Remove 'active' class from all nav-link elements
                $('.nav-link').removeClass('active');
                // Add 'active' class to the matching nav-link element
                $(this).addClass('active');
            }
        });
    }

    // Initial call to set the active class on page load
    updateActiveClass();

    // Add click event listener to each nav-link element
    $('.nav-link').on('click', function () {
        // Simulate a page navigation by updating the window location
        window.history.pushState({}, '', idToRoute[$(this).attr('id')]);
        // Update the active class
        updateActiveClass();
    });

});

function checkEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function hasSpaces(string) {
    return string.includes(" ");
}
function showError(message) {
    const errorDiv = $('#error');
    errorDiv.text(message);
    errorDiv.removeClass('d-none');
    errorDiv.show().delay(3000).fadeOut();
}

function showSuccess(message) {
    const successDiv = $('#success');
    successDiv.text(message);
    successDiv.removeClass('d-none');
    successDiv.show().delay(3000).fadeOut();
}


function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
