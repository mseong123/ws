import { getCookie, showLoading, hideLoading, storeLoginLocalStorage, displayErrorMessages, initializeVerifyEmail, initializeUserInterface, createOtpField } from "./login-utils.js"
import { global } from "./global.js";
import { windowResize } from "./main.js"

document.addEventListener('DOMContentLoaded', function () {
  // Initializations
  initializeVerifyEmail();
  initializeUserInterface();

  // Global variables & localStorage
  const loginForm = document.getElementById('login-form');
//   loginForm.addEventListener('submit', sendOtp);
  loginForm.addEventListener('submit', function(e){
	  e.preventDefault();
	  global.ui.auth = 1;
	  windowResize();
  });

  //login without authentication for local game
  const loginlocal = document.querySelector('.login-local');
  loginlocal.addEventListener('click', function(e){
	global.ui.authNotRequired = 1;
	windowResize();
});

  const savedEmail = localStorage.getItem("savedEmail");
  const savedPassword = localStorage.getItem("savedPassword");

  if (savedEmail && savedPassword) {
    loginForm.elements["email-login"].value = savedEmail;
    loginForm.elements["password-login"].value = savedPassword;
    document.getElementById("remember-me").checked = true;
  }

  // SEND OTP
  async function sendOtp(event) {
    const apiUrl = 'http://127.0.0.1:8000/api/auth_user/send_otp/';
    event.preventDefault();
    showLoading()
    storeLoginLocalStorage(loginForm);
    const loginErrorMsg = document.getElementById("login-error");
    loginErrorMsg.textContent = "";

    // Using Fetch API to send a POST request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginForm.elements['email-login'].value,
        password: loginForm.elements['password-login'].value,
      }),
    });

    hideLoading();
    // Check if the response status is OK (status code 200-299)
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status == 401)
        loginErrorMsg.textContent = "Username and password does not match."
      else if (response.status == 403)
        loginErrorMsg.textContent = "Can't login. Please try again."
      else
        window.alert("Internal server error. Please try again.");
    } else {
      const data = await response.json();
      // Handle the data from the response
      createOtpField();
      loginForm.removeEventListener("submit", sendOtp);
      loginForm.addEventListener("submit", loginOtp);
    }
  };

  // LOGIN WITH OTP
  async function loginOtp(event) {
    const apiUrl = 'http://127.0.0.1:8000/api/auth_user/login/';
    event.preventDefault();
    showLoading()
    storeLoginLocalStorage(loginForm);
    const loginErrorMsg = document.getElementById("login-error");
    loginErrorMsg.textContent = "";

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginForm.elements['email-login'].value,
        password: loginForm.elements['password-login'].value,
        otp: loginForm.elements['otp'].value,
      }),
    });

    hideLoading();
    // Check if the response status is OK (status code 200-299)
    if (!response.ok) {
      if (response.status == 401)
        loginErrorMsg.textContent = "Invalid OTP. Please try again."
      else
        window.alert("Internal server error. Please try again.");
    }
    else {
      // SUCCESS LOGIN LINK TO MSEONG PAGE
    }
  };

  // REGISTER USER FORM
  const registerForm = document.getElementById('register-form');
  registerForm.addEventListener("submit", registerAccount)

  async function registerAccount(event) {
    const apiUrl = 'http://127.0.0.1:8000/api/auth/register/';
    event.preventDefault();
    showLoading();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie("csrftoken"),
      },
      body: JSON.stringify({
        username: registerForm.elements['username-reg'].value,
        email: registerForm.elements['email-reg'].value,
        password1: registerForm.elements['password1-reg'].value,
        password2: registerForm.elements['password2-reg'].value,
      }),
    });

    hideLoading();
    const data = await response.json();
    if (!response.ok) {
      if (response.status == 400)
        displayErrorMessages(data);
      else
        window.alert("Internal server error. Please try again.");
    } else {
      document.getElementById("register-success").style.display = "block";
      registerForm.style.display = "none";
    }
  }

  // RESEND VERIFY EMAIl
  const resendVerifyEmailBtn = document.getElementById("resend-verification-email");
  resendVerifyEmailBtn.addEventListener("click", resendVerificationEmail);

  async function resendVerificationEmail(event) {
    const apiUrl = 'http://127.0.0.1:8000/api/auth/register/resend-email/';
    event.preventDefault();
    showLoading();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie("csrftoken"),
      },
      body: JSON.stringify({
        email: registerForm.elements['email-reg'].value,
      }),
    });

    hideLoading();
    if (!response.ok)
      window.alert("Internal server error. Please try again.");
    else
      window.alert("Verification email was sent again!");
  }

  // SEND RESET PASSWORD EMAIL
  document.getElementById("resend-reset-password-email").addEventListener("click", (event) => {
    sendResetEmailPasswordEmail(event);
  });

  const resetPassForm = document.getElementById('reset-password');
  resetPassForm.addEventListener("submit", sendResetEmailPasswordEmail);

  async function sendResetEmailPasswordEmail(event) {
    const apiUrl = 'http://127.0.0.1:8000/api/auth/password/reset/';
    event.preventDefault();
    showLoading();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie("csrftoken"),
      },
      body: JSON.stringify({
        email: resetPassForm.elements['email-reset'].value,
      }),
    });

    hideLoading();
    const data = response.json();
    if (!response.ok) {
      window.alert("Internal server error. Please try again.");
    } else {
      window.alert("Reset password email was sent!");
      document.getElementById("reset-password-dialog").style.display = "block";
      resetPassForm.style.display = "none";
    }
  }

  // -----------------

  // HELPER FUNCTIONS

  // Generate a secure random string using the browser crypto functions
  function generateRandomString() {
    var array = new Uint32Array(28);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  }

  // Parse a query string into an object
  function parseQueryString(string) {
    if (string == "") { return {}; }
    var segments = string.split("&").map(s => s.split("="));
    var queryString = {};
    segments.forEach(s => queryString[s[0]] = s[1]);
    return queryString;
  }

  // Make a POST request and parse the response as JSON
  function sendPostRequest(url, params, success, error) {
    var request = new XMLHttpRequest();
    request.open('POST', url, true);
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	
    request.onload = function () {
      var body = {};
      try {
        body = JSON.parse(request.response);
      } catch (e) { }

      if (request.status == 200) {
        success(request, body);
      } else {
        error(request, body);
      }
    }
    request.onerror = function () {
      error(request, {});
    }
    var body = Object.keys(params).map(key => key + '=' + params[key]).join('&');
    request.send(body);
  }

  // Configure your application and authorization server details
  var config = {
    client_id: "u-s4t2ud-e98273ec7275fa5dcc7a965135189ae2ca2dfc9eeb445944d2ea02d0a5645a2d",
    redirect_uri: "http://127.0.0.1:8000/",
    authorization_endpoint: "https://api.intra.42.fr/oauth/authorize/",
    token_endpoint: "https://api.intra.42.fr/oauth/token/",
    code_login_endpoint: "http://127.0.0.1:8000/api/auth/fourtytwo/",
    requested_scopes: "public"
  };

  // Set state for redirect
  // social login event listener
  // Initiate the PKCE Auth Code flow is not supported by 42api
  document.getElementById("start").addEventListener("click", async function (e) {
    e.preventDefault();

    // Create and store a random "state" value
    var state = generateRandomString();
    localStorage.setItem("state", state);

    // Create and store a new PKCE code_verifier (the plaintext random secret)
    // var code_verifier = generateRandomString();
    // localStorage.setItem("pkce_code_verifier", code_verifier);

    // Hash and base64-urlencode the secret to use as the challenge
    // var code_challenge = await pkceChallengeFromVerifier(code_verifier);

    // Build the authorization URL
    var url = config.authorization_endpoint
      + "?client_id=" + encodeURIComponent(config.client_id)
      + "&redirect_uri=" + encodeURIComponent(config.redirect_uri)
      + "&state=" + encodeURIComponent(state)
      + "&scope=" + encodeURIComponent(config.requested_scopes)
      + "&response_type=code"
      ;

    // Redirect to the authorization server
    window.location = url;
  });

  // Handle the redirect back from the authorization server and
  // get an access token from the token endpoint
  var q = parseQueryString(window.location.search.substring(1));

  // Check if the server returned an error string
  if (q.error) {
    alert("Error returned from authorization server: " + q.error);
    document.getElementById("error_details").innerText = q.error + "\n\n" + q.error_description;
    document.getElementById("error").classList = "";
  }

  // If the server returned an authorization code, attempt to exchange it for an access token
  if (q.code) {
    // Verify state matches what we set at the beginning
    if (localStorage.getItem("state") != q.state) {
      alert("Invalid state");
    } else {

      // Exchange the authorization code for an access token
      sendPostRequest(config.code_login_endpoint, {
        code: q.code,
      }, function (request, body) {

        // Initialize your application now that you have an access token.
        // Here we just display it in the browser.
        // document.getElementById("access_token").innerText = body.access_token;
        // document.getElementById("start").classList = "hidden";
        // document.getElementById("token").classList = "";
        
        if (body.key)
          sessionStorage.setItem("Authorization", "Token " + body.key)
        // Replace the history entry to remove the auth code from the browser address bar
        window.history.replaceState({}, null, "/");

      }, function (request, error) {
        // This could be an error response from the OAuth server, or an error because the 
        // request failed such as if the OAuth server doesn't allow CORS requests
        document.getElementById("error_details").innerText = error.error + "\n\n" + error.error_description;
        document.getElementById("error").classList = "";
      });
    }

    // Clean these up since we don't need them anymore
    localStorage.removeItem("state");
  }
});
