export function postPage(postId) {
    // Fetch post data from the backend
    fetch(`/api/post?id=${postId}`)
        .then(response => response.json())
        .then(data => {
            const post = data.post;
            const app = document.getElementById('app');
            app.innerHTML = `
                <script src="front-end/static/js/scripts.js"></script>
                <div class="container px-4 px-lg-5">
                    <div class="row gx-4 gx-lg-5 justify-content-center">
                        <div class="col-lg-8">
                            <h1 class="mt-4">${post.Title}</h1>
                            <p class="lead">${post.Content}</p>
                            <p class="lead">
                            <p>by ${post.CreatedBy} - ${post.CreatedOn}</p>
                            </p>
                            <hr>
                            <h2>Comments</h2>
                            <div id="commentsContainer">
                                ${post.Comments.map(comment => `
                                    <div class="card mb-4" id="${comment.ID}">
                                        <div class="card-body">
                                            <p class="card-text">${comment.Content}</p>
                                        </div>
                                        <div class="card-footer text-muted">
                                            <div class="d-flex flex-row gap-2">
                                                <div style="margin: auto auto auto 0">
                                                    Posted by ${comment.CreatedBy} on ${comment.CreatedOn}
                                                </div>
                                                <button type="submit" onclick="likeDislikeComment('${comment.ID}','like')"
                                                    id="like-btn-${comment.ID}"
                                                    class="btn btn-outline-success btn-sm ${comment.Like.IsLiked ? 'custom-hover-like' : ''}">
                                                    <p id="like-count-${comment.ID}" class="d-inline">
                                                        ${comment.Like.CountLikes}
                                                    </p>
                                                    <i class="bi bi-hand-thumbs-up"></i>
                                                </button>
                                                <button type="submit" onclick="likeDislikeComment('${comment.ID}','dislike')"
                                                    id="dislike-btn-${comment.ID}"
                                                    class="btn btn-outline-danger btn-sm ${comment.Like.IsDisliked ? 'custom-hover-dislike' : ''}">
                                                    <p id="dislike-count-${comment.ID}" class="d-inline">
                                                        ${comment.Like.CountDislikes}
                                                    </p>
                                                    <i class="bi bi-hand-thumbs-down"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <hr>
                            <div class="alert alert-danger d-none" id="error"></div>
                            <div class="card my-4">
                                <h5 class="card-header">Leave a Comment:</h5>
                                <div class="card-body">
                                    <div class="form-group mb-3">
                                        <textarea class="form-control" id="comment" rows="3" placeholder="Comment"></textarea>
                                    </div>
                                    <button type="button" id="submit-comment-btn" class="btn btn-primary">Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <script src="/front-end/static/js/comment.js"></script>
            `;

            // Add event listener for the submit comment button
            document.getElementById('submit-comment-btn').addEventListener('click', () => submitComment(post.ID));

            // Hide error message on keypress
            document.querySelector("textarea#comment").addEventListener('keypress', () => {
                document.getElementById('error').classList.add('d-none');
            });
        });
}

export function submitComment(postId) {
    const comment = document.getElementById('comment').value;

    if (comment.trim() === "") {
        showError("Comment cannot be empty");
        return;
    }

    const data = JSON.stringify({
        PostID: postId,
        Content: comment
    });

    fetch('/createCommentAction', {
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
    const data = JSON.stringify({
        ID: commentId,
        IsLike: action
    });

    fetch('/likeOrDislikeComment', {
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
        .then(() => {
            // Refresh the comments section
            const postId = window.location.search.split('=')[1];
            postPage(postId);
        })
        .catch(error => {
            showError(error.message);
        });
}

export function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.innerHTML = message;
    errorDiv.classList.remove('d-none');
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}
