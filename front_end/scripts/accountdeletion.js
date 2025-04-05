document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("deleteForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const password = document.getElementById("password").value;

    // ✅ Use an existing message box instead of creating a new one every time
    let messageBox = document.getElementById("messageBox");
    if (!messageBox) {
      messageBox = document.createElement("p");
      messageBox.id = "messageBox";
      document.querySelector(".container").appendChild(messageBox);
    }

    try {
      const response = await fetch("http://localhost:5000/user/accountdeletion", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password }),
        credentials: "include", // ✅ Ensures cookies are sent
    });    

      const data = await response.json();
      messageBox.style.color = response.ok ? "green" : "red";
      messageBox.textContent = data.message;

      if (response.ok) {
        setTimeout(() => {
          window.location.href = "/"; 
        }, 1000);
      }
    } 
    catch (error) {
      messageBox.style.color = "red";
      messageBox.textContent = "Server error";
      console.error("Error:", error);
    }
  });
});
