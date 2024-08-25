import { postTemplate } from './post.js';

export const index = `
<script src="front-end/static/js/scripts.js"></script>
            <div class="alert alert-danger d-none mt-3" id="error"></div>
            <div class="card text-white bg-secondary my-5 py-4 text-center">
                <div class="card-body">
                    <p class="text-white m-0">Explore, engage, and expand your knowledge with our community forum.</p>
                </div>
            </div>
            <div class="mb-3 d-flex flex-row gap-2">
                <label for="categories" class="m-auto">Categories</label>
                <select class="form-control" name="categories" id="categories">
                    <option selected value="All">All</option>
                </select>
            </div>
            <div class="row gx-4 gx-lg-5" id="posts-container">
            </div>
        <script>
            $("#categories").on("change", function () {
                const category = $(this).val();
                if (category === "All") {
                    $(".col-md-4").show();
                } else {
                    $(".col-md-4").hide();
                    $("." + category).show();
                }
            });

            document.addEventListener('DOMContentLoaded', (event) => {
                $("#categories").val('All');
            });
        </script>
`;

export async function loadCategories() {
    fetch('/api/categories')
        .then(response => response.json())
        .then(data => {
            const categoriesSelect = $('#categories');
            data.forEach(category => {
                const option = $('<option>', {
                    value: category.Name,
                    text: category.Name
                });
                categoriesSelect.append(option);
            });
        });
}

export async function loadPosts(filterUrl) {
    fetch(filterUrl)
        .then(response => response.json())
        .then(data => {
            const postsContainer = $('#posts-container');
            data.forEach(post => {

                const postDiv = $('<div>', {
                    class: `col-md-6 mb-5 ${post.Categories.join(' ')}`,
                    id: post.ID,
                    html: postTemplate(post)
                });

                postsContainer.append(postDiv);
            });
        });
}



export async function homePage() {
    const app = $('#app');
    app.html(index);
    await loadCategories();
    await loadPosts('/api/posts');
}

export async function myPostsPage() {
    const app = $('#app');
    app.html(index);
    await loadCategories();
    await loadPosts('/api/myPosts');
}

export async function likedPostsPage() {
    const app = $('#app');
    app.html(index);
    await loadCategories();
    await loadPosts('/api/likedPosts');
}
