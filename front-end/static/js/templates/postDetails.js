import *  as Comment from './comment.js';

export function postPage(postId) {
    //get  postid from in URL
    const urlParams = new URLSearchParams(window.location.search);
    const postIdParam = urlParams.get('id');
    if (!postId) {
        postId = postIdParam;
    }
    // Fetch post data from the backend
    fetch(`/api/post?id=${postId}`)
        .then(response => response.json())
        .then(data => {
            const post = data;
            const comments = post.Comments || [];
            const commentsSection = comments.length === 0 ?
                '<div class="card mb-4"><div class="card-body"><p class="card-text">No comments yet. Be the first to comment!</p></div></div>' :
                comments.map(comment => Comment.generateComment(comment));


            const app = $('#app');
            app.html(`
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
                                    ${commentsSection}
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
            `);

            // Add event listener for the submit comment button
            $('#submit-comment-btn').on('click', function () {
                Comment.submitComment(post.ID);
            });

            // Add event listeners for like and dislike buttons using jQuery's `on` method
            $('#commentsContainer').on('click', '.like-btn', function () {
                const commentId = $(this).data('id');
                Comment.likeDislikeComment(commentId, 'like');
            });

            $('#commentsContainer').on('click', '.dislike-btn', function () {
                const commentId = $(this).data('id');
                Comment.likeDislikeComment(commentId, 'dislike');
            });

            $('textarea#comment').on('keypress', function () {
                $('#error').addClass('d-none');
            });
        });
}





