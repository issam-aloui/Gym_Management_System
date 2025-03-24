document.getElementById("loginForm").addEventListener("submit", async function(event) {
  event.preventDefault(); // Prevent default form submission
  
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const messageBox = document.getElementById("message");

  try {
      const response = await fetch("http://localhost:5000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      if (response.ok) {
          messageBox.style.color = "green";
          messageBox.textContent = data.message;
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