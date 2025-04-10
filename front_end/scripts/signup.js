document.addEventListener("DOMContentLoaded", function () {

  const signupButton = document.getElementById("signup-button");
  const verifyButton = document.getElementById("verify-code-btn");

  const signupForm = document.getElementById("signupForm");
  const codeBox = document.getElementById("code-verification-box");
  const messageBox = document.getElementById("message");

  let signupData = {};

  
  const savedUsername = sessionStorage.getItem("signup-username");
  const savedEmail = sessionStorage.getItem("signup-email");
  const savedPassword = sessionStorage.getItem("signup-password");
  const showVerification = sessionStorage.getItem("show-verification-box");

  if (savedUsername) document.getElementById("username").value = savedUsername;
  if (savedEmail) document.getElementById("email").value = savedEmail;
  if (savedPassword) document.getElementById("password").value = savedPassword;

  if (showVerification === "true") {
    codeBox.style.display = "block";
  }

  // 📝 2. Save inputs in sessionStorage live
  document.getElementById("username").addEventListener("input", (e) => {
    sessionStorage.setItem("signup-username", e.target.value);
  });
  document.getElementById("email").addEventListener("input", (e) => {
    sessionStorage.setItem("signup-email", e.target.value);
  });
  document.getElementById("password").addEventListener("input", (e) => {
    sessionStorage.setItem("signup-password", e.target.value);
  });

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    signupButton.disabled = true;
    signupButton.innerHTML = ".......";

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (username.length < 3 || username.length > 20) {
      return showMessage("Username must be between 3 and 20 characters.", "red");
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return showMessage("Invalid email format.", "red");
    }

    if (password !== confirmPassword) {
      return showMessage("Passwords do not match.", "red");
    }

    if (password.length < 6 || password.length > 25 || !/\d/.test(password)) {
      return showMessage("Password must be 6-25 characters and contain at least one number.", "red");
    }

    try {
      const res = await fetch("http://localhost:5000/services/request-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("Verification code sent to your email. Please enter it below.", "green");
        codeBox.style.display = "block";
        signupData = { username, email, password };

        
        sessionStorage.setItem("signup-username", username);
        sessionStorage.setItem("signup-email", email);
        sessionStorage.setItem("signup-password", password);
        sessionStorage.setItem("show-verification-box", "true");

      } else {
        showMessage(data.message || "Failed to send verification code.", "red"); signupButton.disabled = false;
        signupButton.innerHTML = "Start Your Fitness Journey";
      }
    } catch (err) {
      showMessage("Error connecting to server.", "red");
    }
  });

  verifyButton.addEventListener("click", async () => {
    verifyButton.disabled = true;
    verifyButton.innerHTML = "Verifying...";

    const code = document.getElementById("verification-code").value.trim();

    if (!code || code.length !== 6) {
      verifyButton.disabled = false;
      verifyButton.innerHTML = "Verify Code";
      return showMessage("Please enter a 6-character verification code.", "red");
    }

    try {
      const verifyRes = await fetch("http://localhost:5000/services/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupData.email, code }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok) {
        const signupRes = await fetch("http://localhost:5000/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signupData),
        });

        const finalData = await signupRes.json();

        if (signupRes.ok) {
          showMessage("Signup successful! You can now join us.", "green");

          
          sessionStorage.removeItem("signup-username");
          sessionStorage.removeItem("signup-email");
          sessionStorage.removeItem("signup-password");
          sessionStorage.removeItem("show-verification-box");

          setTimeout(() => {
            window.location.href = "/";
          }, 1500);

        } else {
          showMessage(finalData.message || "Signup failed after verification.", "red");
        }
      } else {
        showMessage(verifyData.message || "Incorrect verification code.", "red");
      }
    } catch (err) {
      showMessage("Error verifying code.", "red");
    }

    verifyButton.disabled = false;
    verifyButton.innerHTML = "Verify Code";
    signupButton.disabled = false;
    signupButton.innerHTML = "Start Your Fitness Journey";
  });

  const resendbtn = document.getElementById("resend-code-btn");

  resendbtn.addEventListener("click", async () => {

    try {
      const res = await fetch("http://localhost:5000/services/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage("Verification code sent to your email. Please enter it below.", "green");
      } else {
        showMessage(data.message || "Failed to resend verification code.", "red");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "red");
    }

    showMessage("Resending code...", "green");
  });

  function showMessage(text, color) {
    messageBox.style.color = color;
    messageBox.innerHTML = text;
  }

});
