import { navigate,updateNavbar } from '../app.js'; // Adjust the import path based on your directory structure

export function registerPage() {
    const app = $('#app');
    app.html(`
<script src="front-end/static/js/scripts.js"></script>
<div class="container px-4 px-lg-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <h2 class="text-center mt-5 mb-4">Register</h2>
            <div class="alert alert-danger d-none" id="error"></div>
            <div class="alert alert-success d-none" id="success"></div>
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
                    <input class="form-check-input" type="radio" name="gender" id="gender-male" value="M">
                    <label class="form-check-label" for="gender-male">Male</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="gender" id="gender-female" value="F">
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
    `);

    // Add event listener for the register button
    $('#register-btn').click(registerAction);

    // Hide error message on keypress
    $('input').on('keypress', function () {
        $('#error').addClass('d-none');
    });
}

export function registerAction() {

    const firstName = $('#first-name').val().trim();
    const lastName = $('#last-name').val().trim();
    const age = $('#age').val().trim();
    const gender = $('input[name="gender"]:checked').val();
    const email = $('#email').val().trim();
    const username = $('#username').val().trim();
    const password = $('#password').val().trim();

    // Check if there are empty fields or contain only spaces
    if (
        !firstName ||
        !lastName ||
        !age ||
        !gender ||
        !email ||
        !username ||
        !password
    ) {
        showError("Missing required fields");
        return;
    }

    const ageNum = parseInt(age);

    if (!validationFields(ageNum, email, username, password)) {
        return;
    }

    const data = JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        age: ageNum,
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
            // Handle successful registration
            showSuccess("Registration successful");
            setTimeout(() => {
                navigate('/'); // Redirect to the login page
                updateNavbar(true);
            }, 1000);
        })
        .catch(error => {
            debugger;
            showError(error.message);
        });
}


function validationFields(ageNum, email, username, password) {
    if (isNaN(ageNum) || ageNum < 1) {
        showError("Invalid age");
        return false;
    }

    if (!checkEmail(email)) {
        showError("Invalid email");
        return false;
    }

    if (hasSpaces(email)) {
        showError("Email cannot contain spaces");
        return false;
    }
    if (hasSpaces(password)) {
        showError("Password cannot contain spaces");
        return false;
    }
    return true;
}

