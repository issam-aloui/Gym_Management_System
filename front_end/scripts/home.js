async function fetchUsername() {
  try {
      const response = await fetch("http://localhost:5000/user/username", { method: "GET", credentials: "include" });
      const data = await response.json();

      if (response.ok) {
          document.getElementById("username").textContent = data.username;
      } else {
          document.getElementById("username").textContent = "Guest";
      }
  } catch (error) {
      console.error("Error fetching username:", error);
      document.getElementById("username").textContent = "Guest";
  }
}

fetchUsername();

// Logout function (Clears cookie)
document.getElementById("logout").addEventListener("click", async () => {
  await fetch("http://localhost:5000/auth/logout", { method: "POST", credentials: "include" });
  window.location.href = "/login";
});

document.getElementById("changeData").addEventListener("click",async ()=>{
  window.location.href = "/datachange";
})

document.getElementById("deleteaccount").addEventListener("click",async ()=>{
  window.location.href = "/accountdeletion";
})

document.getElementById("joinGym").addEventListener("click",async ()=>{
  window.location.href = "/joingGym";
})

document.getElementById("createGym").addEventListener("click",async ()=>{
  window.location.href = "/creategym";
})