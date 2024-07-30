// Function to add a comment to the page
export function generateComment(comment) {
    return `<div class="card mb-4" id="${comment.ID}">
                        <div class="card-body">
                            <p class="card-text">${comment.Content}</p>
                        </div>
                        <div class="card-footer text-muted">
                            <div class="d-flex flex-row gap-2">
                                <div style="margin: auto auto auto 0">
                                    Posted by ${comment.CreatedBy} on ${comment.CreatedOn}
                                </div>

                                <button type="submit" class="like-btn btn btn-outline-success btn-sm ${comment.Like.IsLiked ? 'custom-hover-like' : ''}" data-id="${comment.ID}" data-action="like">
                                    <p id="like-count-${comment.ID}" class="d-inline">
                                        ${comment.Like.CountLikes}
                                    </p>
                                    <i class="bi bi-hand-thumbs-up"></i>
                                </button>
                                
                                <button type="submit" class="dislike-btn btn btn-outline-danger btn-sm ${comment.Like.IsDisliked ? 'custom-hover-dislike' : ''}" data-id="${comment.ID}" data-action="dislike">
                                    <p id="dislike-count-${comment.ID}" class="d-inline">
                                        ${comment.Like.CountDislikes}
                                    </p>
                                    <i class="bi bi-hand-thumbs-down"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
}


export function submitComment(postId) {
    const comment = $('#comment').val().trim();
    if (comment === "") {
        showError("Comment cannot be empty");
        return;
    }

    const data = JSON.stringify({
        PostID: postId,
        Content: comment
    });

    fetch('/api/createCommentAction', {
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
            return response.json();
        })
        .then(response => {
            // Refresh the comments section
            postPage(postId);
        })
        .catch(error => {
            showError(error.message);
        });
}
export function likeDislikeComment(commentId, action) {
    const commentID = commentId.toString();
    const data = JSON.stringify({
        ID: commentID,
        IsLike: action
    });
    $.ajax({
        url: "/api/likeOrDislikeComment",
        type: "POST",
        contentType: "application/json",
        data: data,  // Send the JSON data object
        success: function (response) {
            const likeBtn = $('#like-btn-' + commentID);
            const dislikeBtn = $('#dislike-btn-' + commentID);

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

            updateCommentCounters(commentID);
        },
        error: function (error) {
            showError(error.responseText);
        }
    });
}

export function updateCommentCounters(commentID) {
    $.ajax({
        url: "/api/getCommentLikeDislikeCount",
        type: "POST",
        data: JSON.stringify({
            ID: commentID
        }),
        success: function (response) {
            $('#like-count-' + commentID).text(response.likes);
            $('#dislike-count-' + commentID).text(response.dislikes);
        },
        error: function (error) {
            alert(error.responseText);
        }
    });
}

// Example usage
const comment = {
    ID: "123",
    Content: "This is a new comment",
    CreatedBy: "User",
    CreatedOn: "2024-07-06",
    Like: {
        IsLiked: false,
        IsDisliked: false
    }
};
