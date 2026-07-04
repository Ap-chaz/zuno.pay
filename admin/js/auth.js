/* =========================================================
   ZUNO Admin — login page logic
   ========================================================= */
(function () {
  "use strict";

  // Already signed in? Skip straight to the dashboard.
  if (window.ZunoAdmin.session.getToken()) {
    window.location.href = "dashboard.html";
    return;
  }

  let params = new URLSearchParams(window.location.search);
  let form = document.getElementById("loginForm");
  let feedback = document.getElementById("loginFeedback");
  let button = document.getElementById("loginBtn");
  let devHint = document.getElementById("devHint");

  if (window.ZUNO_ADMIN_CONFIG.DEV_MODE && devHint) {
    let creds = window.ZUNO_ADMIN_CONFIG.DEV_CREDENTIALS;
    devHint.hidden = false;
    devHint.textContent = "Dev mode — sign in with " + creds.email + " / " + creds.password;
  }

  if (params.get("expired") === "1") {
    feedback.textContent = "Your session expired. Sign in again.";
    feedback.classList.add("form-feedback--error");
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    let email = document.getElementById("email");
    let password = document.getElementById("password");

    if (!email.checkValidity()) {
      email.reportValidity();
      return;
    }
    if (!password.checkValidity()) {
      password.reportValidity();
      return;
    }

    feedback.textContent = "";
    feedback.classList.remove("form-feedback--error");
    button.disabled = true;
    let original = button.textContent;
    button.textContent = "Signing in...";

    try {
      let result = await window.ZunoAdmin.api.login(email.value.trim(), password.value);
      window.ZunoAdmin.session.setSession(result.token, result.admin);
      window.location.href = "dashboard.html";
    } catch (err) {
      feedback.textContent = err.message || "Couldn't sign in. Check your details and try again.";
      feedback.classList.add("form-feedback--error");
      button.disabled = false;
      button.textContent = original;
    }
  });
})();
