function registerPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <script src="front-end/static/js/scripts.js"></script>
        <div class="container px-4 px-lg-5">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <h2 class="text-center mt-5 mb-4">Register</h2>
                    <div class="alert alert-danger d-none" id="error"></div>
                    <div class="form-group mb-3">
                        <label for="email">Email address</label>
                        <input type="email" class="form-control" name="email" id="email" placeholder="Enter email">
                    </div>
                    <div class="form-group mb-3">
                        <label for="username">Username</label>
                        <input type="text" class="form-control" name="username" id="username" placeholder="Enter username">
                    </div>
                    <div class="form-group mb-3">
                        <label for="password">Password</label>
                        <input type="password" class="form-control" name="password" id="password" placeholder="Password">
                    </div>
                    <button type="submit" id="register-btn" class="btn btn-primary btn-block">Register</button>
                </div>
            </div>
        </div>
        <br>
    `;

    // Add event listener for the register button
    document.getElementById('register-btn').addEventListener('click', registerAction);

    // Hide error message on keypress
    document.querySelectorAll("input").forEach(element => {
        element.addEventListener('keypress', () => {
            document.getElementById('error').classList.add('d-none');
        });
    });
}

function registerAction() {
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check if the email, username, and password are empty or contain only spaces
    if (email.trim() === "" || username.trim() === "" || password.trim() === "") {
        showError("Email, Username, and Password are required");
        return;
    }

    const data = JSON.stringify({
        email: email,
        username: username,
        password: password
    });

    fetch('/registerAction', {
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
            // Handle successful registration
            window.location.href = '/login'; // Redirect to the login page
        })
        .catch(error => {
            showError(error.message);
        });
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.innerHTML = message;
    errorDiv.classList.remove('d-none');
    errorDiv.style.display = 'block';
}
