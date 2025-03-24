document.addEventListener("DOMContentLoaded", async () => {
  const gymsList = document.getElementById("gymsList");

  try {
      const response = await fetch("http://localhost:5000/gym/getgyms");
      const gyms = await response.json();
      
      if (gyms.length === 0) {
          gymsList.innerHTML = "<p>No gyms available.</p>";
          return;
      }

      const ul = document.createElement("ul");
      gyms.forEach(gym => {
          const li = document.createElement("li");
          li.innerHTML = `
              <h3>${gym.name}</h3>
              <p><strong>Town:</strong> ${gym.town}</p>
              <p><strong>Price Per Month:</strong> $${gym.pricePerMonth}</p>
              <p><strong>Contact:</strong> ${gym.contact.phone}, ${gym.contact.email}</p>
              <button onclick="joinGym('${gym._id}')">Join Gym</button>
          `;
          ul.appendChild(li);
      });

      gymsList.appendChild(ul);
  } catch (error) {
      console.error("Error fetching gyms:", error);
      gymsList.innerHTML = "<p style='color:red;'>Failed to load gyms.</p>";
  }
});

// Function to handle gym joining (You need to create a backend route for this)
async function joinGym(gymId) {
  try {
      const response = await fetch("http://localhost:5000/gym/joingym", {
          method: "POST",
          credentials: "include",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ gymId })
      });

      const data = await response.json();
      if (response.ok) {
          alert(data.message);
      } else {
          alert("Error: " + data.message);
      }
  } catch (error) {
      console.error("Error joining gym:", error);
      alert("Server error");
  }
}
