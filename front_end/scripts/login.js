document
  .querySelector("#loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const remember = document.querySelector("#inpremember").checked;
    const messageBox = document.querySelector("#message");

    if (username.length < 3 || username.length > 20) {
      messageBox.style.color = "red";
      messageBox.textContent = "Username must be between 3 and 20 characters.";
      return;
    }
    if (password.length < 6 || password.length > 25 || !/\d/.test(password)) {
      messageBox.style.color = "red";
      messageBox.textContent =
        "Password must be 6-25 characters and contain at least one number.";
      return;
    }

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, remember }),
      });

      const data = await response.json();
      if (response.ok) {
        messageBox.style.color = "green";
        messageBox.textContent = data.message;
        sessionStorage.clear();
        globalThis.location.href = "/";
      } else {
        messageBox.style.color = "red";
        messageBox.textContent = data.message || "Login failed!";
      }
    } catch {
      messageBox.style.color = "red";
      messageBox.textContent = "Error connecting to server!";
    }
  });
