document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("signupForm").addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent default form submission
  
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const messageBox = document.getElementById("message");
  
      // Client-side validation (matches backend)
      if (username.length < 3 || username.length > 20) {
        messageBox.style.color = "red";
        messageBox.textContent = "Username must be between 3 and 20 characters.";
        return;
      }
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        messageBox.style.color = "red";
        messageBox.textContent = "Invalid email format.";
        return;
      }
      if (password.length < 6 || password.length > 25 || !/\d/.test(password)) {
        messageBox.style.color = "red";
        messageBox.textContent = "Password must be 6-25 characters and contain at least one number.";
        return;
      }
  
      try {
        const response = await fetch("http://localhost:5000/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
  
        const data = await response.json();
        if (response.ok) {
          messageBox.style.color = "green";
          messageBox.innerHTML = "Signup successful! Go log in <a href='/login'>login</a>";
        } else {
          messageBox.style.color = "red";
          messageBox.textContent = data.message || "Signup failed!";
        }
      } catch (error) {
        messageBox.style.color = "red";
        messageBox.textContent = "Error connecting to server!";
        console.error("Error:", error);
      }
    });
  });
  