// announcements.js

// 1) extract gymId from URL: assumed URL is /gym/{gymId}/announcements.html
function getGymIdFromUrl() {
  const parts = window.location.pathname.split("/");
  return parts[2] || null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const gymId = getGymIdFromUrl();
  const listDiv = document.getElementById("announcement-list");

  // set nav hrefs
  document.getElementById("home-link").href        = `/gym/${gymId}/`;
  document.getElementById("reviews-link").href     = `/gym/${gymId}/reviews`;
  document.getElementById("announcements-link").href = `/gym/${gymId}/annoucements`;

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
      listDiv.innerHTML = announcements.map(a => `
        <div class="announcement">
          <h3>${a.title}</h3>
          <p>${a.yap}</p>
          <small>${new Date(a.createdAt).toLocaleString()}</small>
        </div>
      `).join("");
    }
  } catch (err) {
    console.error("Failed to load announcements:", err);
    listDiv.innerHTML = "<p>Error loading announcements.</p>";
  }
});
