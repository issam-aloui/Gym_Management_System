document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("NameForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // ✅ Prevent form from submitting normally

    const newusername1 = document.getElementById("username1").value;
    const newusername2 = document.getElementById("username2").value;
    const messageBox = document.getElementById("message1");

    try {
      const response = await fetch("http://localhost:5000/user/changename", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username1: newusername1, username2: newusername2 }),
        credentials: "include", // ✅ Ensures cookies are sent
      });

      const data = await response.json();

      if (response.ok) {
        messageBox.style.color = "green";
        messageBox.textContent = data.message;
        setTimeout(() => {
          window.location.href = "/"; // ✅ Redirect after success
        }, 1000);
      } else {
        messageBox.style.color = "red";
        messageBox.textContent = data.message;
      }
    } catch (error) {
      messageBox.style.color = "red";
      messageBox.textContent = "Server error";
      console.error("Error:", error);
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("EmailForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // ✅ Prevent form from submitting normally

    const oldemail = document.getElementById("email1").value;
    const newemail = document.getElementById("email2").value;
    const messageBox = document.getElementById("message2");

    try {
      const response = await fetch("http://localhost:5000/user/changeemail", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email1: oldemail, email2: newemail }),
        credentials: "include", // ✅ Ensures cookies are sent
      });

      const data = await response.json();

      if (response.ok) {
        messageBox.style.color = "green";
        messageBox.textContent = data.message;
        setTimeout(() => {
          window.location.href = "/"; // ✅ Redirect after success
        }, 1000);
      } else {
        messageBox.style.color = "red";
        messageBox.textContent = data.message;
      }
    } catch (error) {
      messageBox.style.color = "red";
      messageBox.textContent = "Server error";
      console.error("Error:", error);
    }
  });
});



document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("PasswordForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // ✅ Prevent form from submitting normally

    const oldePass = document.getElementById("password1").value;
    const newPass1 = document.getElementById("password2").value;
    const newPass2 = document.getElementById("password3").value;
    const messageBox = document.getElementById("message3");

    try {
      const response = await fetch("http://localhost:5000/user/changePassword", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass1: oldePass, pass2: newPass1 , pass3 : newPass2 }),
        credentials: "include", // ✅ Ensures cookies are sent
      });

      const data = await response.json();

      if (response.ok) {
        messageBox.style.color = "green";
        messageBox.textContent = data.message;
        setTimeout(() => {
          window.location.href = "/"; // ✅ Redirect after success
        }, 1000);
      } else {
        messageBox.style.color = "red";
        messageBox.textContent = data.message;
      }
    } catch (error) {
      messageBox.style.color = "red";
      messageBox.textContent = "Server error";
      console.error("Error:", error);
    }
  });
});
