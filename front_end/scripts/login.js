document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault(); // Prevent default form submission
  
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const remember = document.getElementById("inpremember").checked;
  const messageBox = document.getElementById("message");

  if (username.length < 3 || username.length > 20) {
    messageBox.style.color = "red";
    messageBox.textContent = "Username must be between 3 and 20 characters.";
    return;
  }
  if (password.length < 6 || password.length > 25 || !/\d/.test(password)) {
    messageBox.style.color = "red";
    messageBox.textContent = "Password must be 6-25 characters and contain at least one number.";
    return;
  }

  try {
      const response = await fetch("http://localhost:5000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, remember })
      });

      const data = await response.json();
      if (response.ok) {
          messageBox.style.color = "green";
          messageBox.textContent = data.message;
          sessionStorage.clear();
          window.location.href = "/";
      } else {
          messageBox.style.color = "red";
          messageBox.textContent = data.message || "Login failed!";
      }
  } catch (error) {
      messageBox.style.color = "red";
      messageBox.textContent = "Error connecting to server!";
  }
});