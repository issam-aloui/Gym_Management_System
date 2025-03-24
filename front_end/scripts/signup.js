document.getElementById("signupForm").addEventListener("submit", async function(event) {
  event.preventDefault(); // Prevent default form submission
  
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const messageBox = document.getElementById("message");

  try {
      const response = await fetch("http://localhost:5000/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password })
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
  }
});