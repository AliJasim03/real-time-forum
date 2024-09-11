import { registerAction } from '../app.js';

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



export function validationFields(ageNum, email, username, password) {
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

