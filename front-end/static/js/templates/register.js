export function registerPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
<script src="front-end/static/js/scripts.js"></script>
<div class="container px-4 px-lg-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <h2 class="text-center mt-5 mb-4">Register</h2>
            <div class="alert alert-danger d-none" id="error"></div>
            <div class="row">
                <div class="col-md-6 form-group mb-3">
                    <label for="first-name">First Name</label>
                    <input type="text" class="form-control" name="first-name" id="first-name"
                        placeholder="Enter first name">
                </div>
                <div class="col-md-6 form-group mb-3">
                    <label for="last-name">Last Name</label>
                    <input type="text" class="form-control" name="last-name" id="last-name"
                        placeholder="Enter last name">
                </div>
            </div>
            <div class="form-group mb-3">
                <label for="age">Age</label>
                <input type="number" class="form-control" name="age" id="age" placeholder="Enter age">
            </div>
            <div class="form-group mb-3">
                <label>Gender</label><br>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="gender" id="gender-male" value="Male">
                    <label class="form-check-label" for="gender-male">Male</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="gender" id="gender-female" value="Female">
                    <label class="form-check-label" for="gender-female">Female</label>
                </div>
            </div>
            <div class="form-group mb-3">
                <label for="username">Nickname</label>
                <input type="text" class="form-control" name="username" id="username" placeholder="Enter username">
            </div>
            <div class="form-group mb-3">
                <label for="email">Email address</label>
                <input type="email" class="form-control" name="email" id="email" placeholder="Enter email">
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

export function registerAction() {

    const firstName = $('#first-name').val();
    const lastName = $('#last-name').val();
    const age = $('#age').val();
    const gender = $('input[name="gender"]:checked').val();
    const email = $('#email').val();
    const username = $('#username').val();
    const password = $('#password').val();

    // Check if there are empty fields or contain only spaces
    if (
        !firstName.trim() ||
        !lastName.trim() ||
        !age.trim() ||
        !gender ||
        !email.trim() ||
        !username.trim() ||
        !password.trim()
    ) {
        showError("Missing required fields");
        return;
    }

    const data = JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        age: age,
        email: email,
        gender: gender,
        username: username,
        password: password,
    });

    fetch('/api/registerAction', {
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
            window.location.href = '/'; // Redirect to the login page
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
    errorDiv.fadeOut(3000);
}
