export async function createPostPage() {
    // Fetch categories from the backend
    fetch('/api/categories')
        .then(response => response.json())
        .then(data => {
            const app = $('#app');
            app.html(`
                <div class="container px-4 px-lg-5">
                    <div class="row justify-content-center">
                        <div class="col-md-6">
                            <h2 class="text-center mt-5 mb-4">Create Post</h2>
                            <div class="alert alert-danger d-none" id="error"></div>
                            <div class="alert alert-success d-none" id="success"></div>
                            <div class="form-group mb-3">
                                <label for="title">Title</label>
                                <input required type="text" class="form-control" name="title" id="title" placeholder="Enter title">
                            </div>
                            <div class="form-group mb-3">
                                <label for="content">Content</label>
                                <textarea required class="form-control" name="content" id="content" rows="5" placeholder="Enter content"></textarea>
                            </div>
                            <label for="content">Categories: </label>
                            <div class="form-group mb-3" id="categories-container">
                                ${data.map(category => `
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="categories" value="${category.Name}" id="flexCheckDefault-${category.Name}">
                                        <label class="form-check-label" for="flexCheckDefault-${category.Name}">
                                            ${category.Name}
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                            <button id='create-btn' type="button" class="btn btn-primary btn-block">Create Post</button>
                        </div>
                    </div>
                </div>
                <br>
            `);

            // Add event listener for the create post button
            $('#create-btn').click(createPost);

            // Hide alerts on keypress
            // Hide error message on keypress
            $('input').on('keypress', function () {
                $('#error').addClass('d-none');
            });

        });

}

export function createPost() {
    const createBtn = $('#create-btn');
    createBtn.prop('disabled', true);

    const title = $('#title').val().trim();
    const content = $('#content').val().trim();
    const categories = Array.from(document.querySelectorAll("input[name='categories']:checked")).map(el => el.value);

    // Check if the title and content are empty or contain only spaces
    if (title === "" || content === "") {
        showError("Title and Content are required");
        createBtn.disabled = false;
        return;
    }
    // Check if the categories are empty
    if (categories.length === 0) {
        showError("Categories are required");
        createBtn.prop('disabled', false);
        return;
    }

    const data = JSON.stringify({
        Title: title,
        Content: content,
        Categories: categories
    });

    fetch('/api/createPostAction', {
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
            showSuccess("Post Created Successfully");
            setTimeout(() => {
                window.location.href = 'post?id=' + response;
            }, 3000);
        })
        .catch(error => {
            showError(error.message);
            createBtn.prop('disabled', false);
        });
}



