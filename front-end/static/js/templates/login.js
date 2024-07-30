export function loginPage() {
    const app = $('#app');
    app.html(`
        <script src="front-end/static/js/scripts.js"></script>
        <div class="container px-4 px-lg-5">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <h2 class="text-center mt-5 mb-4">Login</h2>
                    <div class="alert alert-danger d-none" id="error"></div>
                    <div class="form-group mb-3">
                        <label for="email">Email address</label>
                        <input type="email" class="form-control" name="email" id="email" placeholder="Enter email">
                    </div>
                    <div class="form-group mb-3">
                        <label for="password">Password</label>
                        <input type="password" class="form-control" name="password" id="password" placeholder="Password">
                    </div>
                    <button type="submit" id="login-btn" class="btn btn-primary btn-block">Login</button>
                    <div id="error" style="display:none;color:red;"></div>
                </div>
            </div>
        </div>
        <br>
    `);

    // Add event listener for the login button
    $('#login-btn').click(loginAction);

    // Hide error message on keypress
    $('input').on('keypress', function () {
        $('#error').addClass('d-none');
    });

}

export function loginAction() {
    const email = $('#email').val();
    const password = $('#password').val();

    // Check if the email and password are empty or contain only spaces
    if (email.trim() === "" || password.trim() === "") {
        showError("Email and Password are required");
        return;
    }

    const data = JSON.stringify({
        email: email,
        password: password
    });

    fetch('/api/loginAction', {
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
            // Handle successful login
            //show login success message
            showSuccess("Login successful");
            window.location.href = '/'; // Redirect to the home page or dashboard
        })
        .catch(error => {
            debugger;
            showError(error.message);
        });
}