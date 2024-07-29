import { postTemplate } from './post.js';

export const index = `
<script src="front-end/static/js/scripts.js"></script>
        <div class="container px-4 px-lg-5">
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
                document.getElementById('categories').value = 'All';
            });
        </script>
`;

export function loadCategories() {
    fetch('/api/categories')
        .then(response => response.json())
        .then(data => {
            const categoriesSelect = document.getElementById('categories');
            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.Name;
                option.textContent = category.Name;
                categoriesSelect.appendChild(option);
            });
        });
}

export function loadPosts() {
    fetch('/api/posts')
        .then(response => response.json())
        .then(data => {
            const postsContainer = document.getElementById('posts-container');
            postsContainer.innerHTML = '';
            data.posts.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = `col-md-4 mb-5 ${post.Categories.join(' ')}`;
                postDiv.id = post.ID;
                postDiv.innerHTML = postTemplate(post);
                postsContainer.appendChild(postDiv);
            });
        });
}

