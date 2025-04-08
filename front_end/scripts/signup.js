document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const codeBox = document.getElementById("code-verification-box");
  const verifyBtn = document.getElementById("verify-code-btn");
  const messageBox = document.getElementById("message");

  let signupData = {}; // To store values between steps

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Simple validations
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

    // Step 1: Send verification code
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
        signupData = { username, email, password }; // store for later
      } else {
        showMessage(data.message || "Failed to send verification code.", "red");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "red");
    }
  });

  verifyBtn.addEventListener("click", async () => {
    const code = document.getElementById("verification-code").value.trim();

    if (!code || code.length !== 6) {
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
        // Proceed to actual signup
        const signupRes = await fetch("http://localhost:5000/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signupData),
        });

        const finalData = await signupRes.json();

        if (signupRes.ok) {
          showMessage("Signup successful! You can now <a href='/login'>log in</a>.", "green");
        } else {
          showMessage(finalData.message || "Signup failed after verification.", "red");
        }
      } else {
        showMessage(verifyData.message || "Incorrect verification code.", "red");
      }
    } catch (err) {
      showMessage("Error verifying code.", "red");
    }
  });

  function showMessage(text, color) {
    messageBox.style.color = color;
    messageBox.innerHTML = text;
  }
});
