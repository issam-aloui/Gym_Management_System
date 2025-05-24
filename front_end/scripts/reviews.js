function getGymIdFromUrl() {
  const parts = window.location.pathname.split("/");
  return parts[2] || null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const gymId = getGymIdFromUrl();
  if (!gymId) {
    console.error("Gym ID not found in the URL.");
    return;
  }

  const reviewList = document.getElementById("review-list");

  try {
    const response = await fetch(`/reviews/${gymId}`);
    const result = await response.json();

    if (!Array.isArray(result)) {
      console.error("Expected an array but got:", result);
      reviewList.innerHTML = "<p>There was an error loading reviews.</p>";
      return;
    }

    result.forEach((review) => {
      const reviewHTML = `
        <div class="review">
          <div class="review-rating">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
          <p class="review-comment">${review.comment}</p>
          <p class="review-author">- ${review.user?.username || "Unknown"}</p>
        </div>
      `;
      reviewList.innerHTML += reviewHTML;
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    reviewList.innerHTML = "<p>There was an error fetching the reviews.</p>";
  }
});

const reviewForm = document.getElementById("add-review-form");

if (reviewForm) {
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rating = document.getElementById("rating").value;
    const comment = document.getElementById("comment").value;
    const gymId = getGymIdFromUrl();

    if (!gymId) {
      alert("Gym ID not found.");
      return;
    }

    try {
      const response = await fetch("/reviews", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gymId, rating, comment }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        location.reload();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error adding review:", error);
      alert("There was an error adding the review.");
    }
  });
}
