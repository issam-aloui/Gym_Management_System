document.addEventListener("DOMContentLoaded", async () => {
  let gymId = null;

  // Show loading state
  showLoadingState();

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
    hideLoadingState();
    showEmptyState();
    return;
  }

  await loadAnnouncements(gymId);
  setupForm(gymId);
});

function showLoadingState() {
  const loadingState = document.getElementById("loading-state");
  const emptyState = document.getElementById("empty-state");
  const announcementList = document.getElementById("announcement-list");

  if (loadingState) loadingState.style.display = "flex";
  if (emptyState) emptyState.style.display = "none";
  if (announcementList) announcementList.style.display = "none";
}

function hideLoadingState() {
  const loadingState = document.getElementById("loading-state");
  if (loadingState) loadingState.style.display = "none";
}

function showEmptyState() {
  const emptyState = document.getElementById("empty-state");
  const announcementList = document.getElementById("announcement-list");

  if (emptyState) emptyState.style.display = "flex";
  if (announcementList) announcementList.style.display = "none";
}

function hideEmptyState() {
  const emptyState = document.getElementById("empty-state");
  const announcementList = document.getElementById("announcement-list");

  if (emptyState) emptyState.style.display = "none";
  if (announcementList) announcementList.style.display = "flex";
}

async function loadAnnouncements(gymId) {
  const listDiv = document.getElementById("announcement-list");

  try {
    const res = await fetch(`/announcements/${gymId}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const announcements = await res.json();

    hideLoadingState();

    if (!Array.isArray(announcements) || announcements.length === 0) {
      showEmptyState();
    } else {
      hideEmptyState();
      renderAnnouncements(announcements);
    }
  } catch (err) {
    console.error("Failed to load announcements:", err);
    hideLoadingState();
    listDiv.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        Error loading announcements. Please try again later.
      </div>
    `;
    listDiv.style.display = "block";
  }
}

function renderAnnouncements(announcements) {
  const listDiv = document.getElementById("announcement-list");

  listDiv.innerHTML = announcements
    .map((announcement) => createAnnouncementCard(announcement))
    .join("");
}

function createAnnouncementCard(announcement) {
  const formattedDate = new Date(announcement.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return `
    <div class="announcement-item" data-id="${announcement._id}">
      <div class="announcement-header">
        <div>
          <h3 class="announcement-title">${escapeHtml(announcement.title)}</h3>
        </div>
      </div>
      
      <div class="announcement-content">
        ${escapeHtml(announcement.yap)}
      </div>
      
      <div class="announcement-meta">
        <div class="announcement-date">
          <i class="fas fa-clock"></i>
          ${formattedDate}
        </div>
        
        <div class="announcement-actions">
          <button class="delete-btn" onclick="deleteAnnouncement('${
            announcement._id
          }')">
            <i class="fas fa-trash-alt"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function deleteAnnouncement(announcementId) {
  if (!confirm("Are you sure you want to delete this announcement?")) {
    return;
  }

  try {
    const res = await fetch(`/announcements/${announcementId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      // Remove the announcement from the DOM with animation
      const announcementElement = document.querySelector(
        `[data-id="${announcementId}"]`
      );
      if (announcementElement) {
        announcementElement.style.opacity = "0";
        announcementElement.style.transform = "translateX(-100%)";
        setTimeout(() => {
          announcementElement.remove();

          // Check if list is empty
          const remainingAnnouncements =
            document.querySelectorAll(".announcement-item");
          if (remainingAnnouncements.length === 0) {
            showEmptyState();
          }
        }, 300);
      }
    } else {
      const result = await res.json();
      alert(`Failed to delete announcement: ${result.message}`);
    }
  } catch (error) {
    console.error("Error deleting announcement:", error);
    alert("Something went wrong while deleting the announcement.");
  }
}

function setupForm(gymId) {
  const form = document.getElementById("announcement-form");
  const messageBox = document.getElementById("message-box");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const yap = document.getElementById("yap").value.trim();
    const submitButton = form.querySelector('button[type="submit"]');

    // Clear previous messages
    messageBox.style.display = "none";
    messageBox.className = "";

    // Validation
    if (title.length <= 6) {
      showMessage("Title must be more than 6 characters.", "error");
      return;
    }

    if (yap.length <= 10) {
      showMessage("Content must be more than 10 characters.", "error");
      return;
    }

    if (!title || !yap || !gymId) {
      showMessage("All fields are required.", "error");
      return;
    }

    // Show loading state on button
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Creating...';
    submitButton.disabled = true;

    try {
      const res = await fetch("/announcements", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, yap, gym: gymId }),
      });

      const result = await res.json();

      if (res.ok) {
        showMessage("Announcement created successfully!", "success");

        // Reset form
        form.reset();

        // Reload announcements
        setTimeout(async () => {
          await loadAnnouncements(gymId);
        }, 1500);
      } else {
        showMessage(
          `Failed to create announcement: ${result.message}`,
          "error"
        );
      }
    } catch (err) {
      console.error("Error creating announcement:", err);
      showMessage(
        "Something went wrong while creating the announcement.",
        "error"
      );
    } finally {
      // Restore button
      setTimeout(() => {
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
      }, 1000);
    }
  });
}

function showMessage(message, type) {
  const messageBox = document.getElementById("message-box");
  messageBox.textContent = message;
  messageBox.className = type;
  messageBox.style.display = "block";

  // Auto-hide success messages
  if (type === "success") {
    setTimeout(() => {
      messageBox.style.display = "none";
    }, 3000);
  }
}
