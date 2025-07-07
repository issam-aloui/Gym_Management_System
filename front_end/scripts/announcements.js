function getGymIdFromUrl() {
  const parts = globalThis.location.pathname.split("/");
  return parts[2] || null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const gymId = getGymIdFromUrl();
  const listDiv = document.querySelector("#announcement-list");
  const loadingDiv = document.querySelector("#loading");
  const emptyStateDiv = document.querySelector("#empty-state");

  // Set footer navigation links
  document.querySelector("#home-link").href = `/gym/${gymId}/`;
  document.querySelector("#reviews-link").href = `/gym/${gymId}/reviews`;
  document.querySelector("#announcements-link").href = `/gym/${gymId}/announcements`;

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
  } catch (error) {
    console.error("Failed to load announcements:", error);
    loadingDiv.style.display = "none";
    listDiv.style.display = "block";
    listDiv.innerHTML = "<p>Error loading announcements.</p>";
  }
});
