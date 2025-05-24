document.addEventListener("DOMContentLoaded", async () => {
  let gymId = null;
  try {
    const response = await fetch("http://localhost:5000/gym/getgym", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      gymId = data.gymId;
    } else {
      console.log("Failed to fetch gym:", data.message);
    }
  } catch (error) {
    console.log("Error fetching gym:", error);
  }

  if (!gymId) {
    console.log("No gym ID found");
    return;
  }
  const listDiv = document.getElementById("announcement-list");

  if (!gymId) {
    listDiv.innerHTML = "<p>Error: gym ID not found in URL.</p>";
    return;
  }

  try {
    const res = await fetch(`/announcements/${gymId}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const announcements = await res.json();

    if (!Array.isArray(announcements) || announcements.length === 0) {
      listDiv.innerHTML = "<p>No announcements available.</p>";
    } else {
      listDiv.innerHTML = announcements
        .map(
          (a) => `
        <div class="announcement">
          <h3>${a.title}</h3>
          <p>${a.yap}</p>
          <small>${new Date(a.createdAt).toLocaleString()}</small>
        </div>
      `
        )
        .join("");
    }
  } catch (err) {
    console.error("Failed to load announcements:", err);
    listDiv.innerHTML = "<p>Error loading announcements.</p>";
  }
  const form = document.getElementById("announcement-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const yap = document.getElementById("yap").value.trim();
    const messageBox = document.getElementById("message-box");

    if (title.length <= 6) {
      messageBox.textContent = "Title must be more than 6 characters.";
      messageBox.classList.add("error");
      return;
    }

    if (yap.length <= 10) {
      messageBox.textContent = "Yap must be more than 10 characters.";
      messageBox.classList.add("error");
      return;
    }

    const gym = gymId;

    if (!title || !yap || !gym) {
      alert("All fields are required.");
      return;
    }

    try {
      const res = await fetch("/announcements", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, yap, gym }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Announcement created successfully!");

        window.location.reload();
      } else {
        alert(`Failed to create announcement: ${result.message}`);
      }
    } catch (err) {
      console.error("Error creating announcement:", err);
      alert("Something went wrong while creating the announcement.");
    }
  });
});
