export function createPostPage() {
    // Fetch categories from the backend
    fetch('/api/categories')
        .then(response => response.json())
        .then(data => {
            const app = document.getElementById('app');
            app.innerHTML = `
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
                                ${data.categories.map(category => `
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="categories" value="${category.Name}" id="flexCheckDefault">
                                        <label class="form-check-label" for="flexCheckDefault">
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
            `;

            // Add event listener for the create post button
            document.getElementById('create-btn').addEventListener('click', createPost);

            // Hide alerts on keypress
            document.querySelectorAll("input, textarea").forEach(element => {
                element.addEventListener('keypress', () => {
                    document.getElementById('error').classList.add('d-none');
                    document.getElementById('success').classList.add('d-none');
                });
            });
        });
}

export function createPost() {
    const createBtn = document.getElementById('create-btn');
    createBtn.disabled = true;

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const categories = Array.from(document.querySelectorAll("input[name='categories']:checked")).map(el => el.value);

    // Check if the title and content are empty or contain only spaces
    if (title.trim() === "" || content.trim() === "") {
        showError("Title and Content are required");
        createBtn.disabled = false;
        return;
    }

    // Check if the categories are empty
    if (categories.length === 0) {
        showError("Categories are required");
        createBtn.disabled = false;
        return;
    }

    const data = JSON.stringify({
        Title: title,
        Content: content,
        Categories: categories
    });

    fetch('/createPostAction', {
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
            createBtn.disabled = false;
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

export function showSuccess(message) {
    const successDiv = document.getElementById('success');
    successDiv.innerHTML = message;
    successDiv.classList.remove('d-none');
    successDiv.style.display = 'block';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}
