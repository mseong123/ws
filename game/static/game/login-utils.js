function initializeVerifyEmail() {
    const customData = document.getElementById("custom-data");
	const verificationKey = [];
    if (verificationKey.length != 0) {
        const apiUrl = 'http://127.0.0.1:8000/api/auth/register/verify-email/';

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie("csrftoken"),
            },
            body: JSON.stringify({
                key: verificationKey,
            }),
        }).then((response) => {
            if (!response.ok)
                throw new Error(`HTTP error! Status: ${response.status}`);
            return (response.json());
        }).then((data) => {
            console.log("SUCCESS with data:");
            console.log(data);

            document.getElementById('login-form-div').style.display = 'none';
            document.getElementById('verify-success').style.display = 'block';

        }).catch(err => {
            console.error('Fetch error:', err);
            document.getElementById('login-form-div').style.display = 'none';
            document.getElementById('verify-failed').style.display = 'block';
        })
    }
}

function initializeUserInterface() {
    document.getElementById('login-form-div').style.display = 'block';
    document.getElementById('register-form-div').style.display = 'none';

    const registerToggle = document.getElementById("register-toggle");
    registerToggle.addEventListener("click", (event) => {
        event.preventDefault();
        document.getElementById('login-form-div').style.display = 'none';
        document.getElementById('register-form-div').style.display = 'block';
    });

    const loginToggle = document.getElementById("login-toggle");
    loginToggle.addEventListener("click", (event) => {
        event.preventDefault();
        document.getElementById('login-form-div').style.display = 'block';
        document.getElementById('register-form-div').style.display = 'none';
    });

    const resetPassBtn = document.getElementById("reset-password-btn");
    resetPassBtn.addEventListener("click", (event) => {
        event.preventDefault();
        document.getElementById('login-form-div').style.display = 'none';
        document.getElementById('reset-password-form').style.display = 'block';
    });

    document.getElementById('reset-password-close-button').onclick = function () {
        document.getElementById('login-form-div').style.display = 'block';
        document.getElementById('reset-password-form').style.display = 'none';
        return false;
    };
}

function createOtpField() {
    const divInput = document.createElement('div');
    divInput.setAttribute('class', 'input-box')
    const otpInput = document.createElement('input');
    otpInput.setAttribute('type', 'text')
    otpInput.setAttribute('id', 'otp')
    otpInput.setAttribute('name', 'otp')
    otpInput.setAttribute('placeholder', 'Enter OTP')
    otpInput.setAttribute('required', '')
    const login_fields = document.getElementById('login-input-fields');
    divInput.appendChild(otpInput)
    login_fields.appendChild(divInput);
}

function showLoading() {
    document.getElementById("login-btn").style.display = "none";
    document.getElementById("register-btn").style.display = "none";
    document.getElementById("reset-pass-btn").style.display = "none";
    document.getElementById("loading-spinner").style.display = "block";
    document.getElementById("dimmed-bg").style.display = "block";
}

function hideLoading() {
    document.getElementById("login-btn").style.display = "block";
    document.getElementById("register-btn").style.display = "block";
    document.getElementById("reset-pass-btn").style.display = "block";
    document.getElementById("loading-spinner").style.display = "none";
    document.getElementById("dimmed-bg").style.display = "none";
}

function storeLoginLocalStorage(loginForm) {
    const email = loginForm.elements['email-login'].value;
    const password = loginForm.elements['password-login'].value;
    const rememberMe = document.getElementById("remember-me").checked;
    if (rememberMe) {
        localStorage.setItem("savedEmail", email);
        localStorage.setItem("savedPassword", password);
    } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedPassword");
    }
}

function displayErrorMessages(errors) {
    // Clear existing error messages
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach(errorMessage => {
        errorMessage.parentNode.removeChild(errorMessage);
    });

    // Display error messages for each field
    for (let field in errors) {
        const errorMessage = errors[field][0]; // Get the first error message for the field
        if (field == "non_field_errors")
            field = "password2";
        const inputField = document.getElementById(field + "-reg"); // Find the input field by ID
        const errorElement = document.createElement("div"); // Create a new div for the error message
        errorElement.classList.add("error-message");
        errorElement.textContent = errorMessage; // Set the error message text
        errorElement.style.marginTop = '2px';
        errorElement.style.paddingLeft = '10px';
        errorElement.style.color = "#ffbb00";
        inputField.parentNode.appendChild(errorElement); // Append the error message after the input field
    }
}

// Get the value of a cookie
function getCookie(name) {
    let value = `; ${document.cookie}`;
    let parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export {initializeVerifyEmail, initializeUserInterface, createOtpField, showLoading, hideLoading, storeLoginLocalStorage, displayErrorMessages, getCookie}