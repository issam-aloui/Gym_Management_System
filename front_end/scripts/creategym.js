document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("gymForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const gymname = document.getElementById("name").value.trim();
    const town = document.getElementById("town").value.trim();
    const latitude = parseFloat(document.getElementById("latitude").value);
    const longitude = parseFloat(document.getElementById("longitude").value);
    const pricebymounth = parseInt(document.getElementById("pricePerMonth").value);
    const phonenumber = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const messagebox = document.getElementById("messagebox");

    // Client-side validation (matches backend rules)
    const phoneRegex = /^(?:\+213|0)(5|6|7|2)[0-9]{8}$/; // Algerian phone format

    if (gymname.length < 5 || gymname.length > 20) {
      messagebox.style.color = "red";
      messagebox.textContent = "Gym name must be between 5 and 20 characters.";
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      messagebox.style.color = "red";
      messagebox.textContent = "Invalid email format.";
      return;
    }
    if (!phoneRegex.test(phonenumber)) {
      messagebox.style.color = "red";
      messagebox.textContent = "Invalid Algerian phone number format.";
      return;
    }
    if (latitude < -90 || latitude > 90 || isNaN(latitude)) {
      messagebox.style.color = "red";
      messagebox.textContent = "Latitude must be between -90 and 90.";
      return;
    }
    if (longitude < -180 || longitude > 180 || isNaN(longitude)) {
      messagebox.style.color = "red";
      messagebox.textContent = "Longitude must be between -180 and 180.";
      return;
    }
    if (town.length < 4 || town.length > 10) {
      messagebox.style.color = "red";
      messagebox.textContent = "Town name must be between 4 and 10 characters.";
      return;
    }
    if (pricebymounth < 0 || pricebymounth > 10000 || isNaN(pricebymounth)) {
      messagebox.style.color = "red";
      messagebox.textContent = "Price must be between 0 and 10,000.";
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/gym/creategym", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymname, town, latitude, longitude, pricebymounth, phonenumber, email }),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        messagebox.style.color = "green";
        messagebox.textContent = data.message;
        setTimeout(() => {
          window.location.href = "/"; // Redirect after success
        }, 1000);
      } else {
        messagebox.style.color = "red";
        messagebox.textContent = data.message;
      }
    } catch (error) {
      messagebox.style.color = "red";
      messagebox.textContent = "Server error";
      console.error("Error:", error);
    }
  });
});
