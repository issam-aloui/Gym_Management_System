function getGymIdFromUrl() {
  const parts = window.location.pathname.split("/");
  return parts[2] || null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const gymId = getGymIdFromUrl();
  const listDiv = document.getElementById("announcement-list");
  const loadingDiv = document.getElementById("loading");
  const emptyStateDiv = document.getElementById("empty-state");

  // Set footer navigation links
  document.getElementById("home-link").href = `/gym/${gymId}/`;
  document.getElementById("reviews-link").href = `/gym/${gymId}/reviews`;
  document.getElementById("announcements-link").href = `/gym/${gymId}/announcements`;

  if (!gymId) {
    loadingDiv.style.display = "none";
    listDiv.style.display = "block";
    listDiv.innerHTML = "<p>Error: gym ID not found in URL.</p>";
    return;
  }

  try {
    const res = await fetch(`/announcements/${gymId}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const announcements = await res.json();

    loadingDiv.style.display = "none";

    if (!Array.isArray(announcements) || announcements.length === 0) {
      emptyStateDiv.style.display = "block";
    } else {
      listDiv.style.display = "grid";
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
    loadingDiv.style.display = "none";
    listDiv.style.display = "block";
    listDiv.innerHTML = "<p>Error loading announcements.</p>";
  }
});
