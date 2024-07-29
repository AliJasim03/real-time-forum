export function postTemplate(post) {
    return `
        <div class="card h-100">
            <div class="card-body">
                <h2 class="card-title">${post.Title}</h2>
                <p class="card-text">${post.Content}</p>
            </div>
            <div class="card-footer d-flex justify-content-between align-items-center">
                <div class="col">
                    <div class="row">
                        <p class="mb-0"><strong>${post.CreatedBy}</strong></p>
                        <p class="mb-0 text-muted">${post.CreatedOn}</p>
                    </div>
                </div>
                <div class="col-auto">
                    <div class="row">
                        <div class="d-flex flex-row-reverse mb-2 gap-2">
                            <button type="button" id="dislike-btn-${post.ID}"
                                onclick="likeDislikePost('${post.ID}', 'dislike')"
                                class="btn btn-outline-danger btn-sm ${post.Like.IsDisliked ? 'custom-hover-dislike' : ''}">
                                <p id="dislike-count-${post.ID}" class="d-inline">
                                    ${post.Like.CountDislikes}
                                </p>
                                <i class="bi bi-hand-thumbs-down"></i>
                            </button>
                            <button type="button" id="like-btn-${post.ID}"
                                onclick="likeDislikePost('${post.ID}', 'like')"
                                class="btn btn-outline-success btn-sm ${post.Like.IsLiked ? 'custom-hover-like' : ''}">
                                <p id="like-count-${post.ID}" class="d-inline">
                                    ${post.Like.CountLikes}
                                </p>
                                <i class="bi bi-hand-thumbs-up"></i>
                            </button>
                        </div>
                    </div>
                    <a class="btn btn-primary btn-sm" href="/post?id=${post.ID}">View Comments</a>
                </div>
            </div>
        </div>
    `;
}
