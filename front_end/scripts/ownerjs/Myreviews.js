document.addEventListener("DOMContentLoaded", async () => {
  let gymId = null;
  const reviewList = document.getElementById("review-list");
  const loadingState = document.getElementById("loading-state");
  const emptyState = document.getElementById("empty-state");

  // Show loading state
  loadingState.style.display = "flex";

  try {
    const response = await fetch("http://localhost:5000/gym/getgym", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
      gymId = data.gymId;
      console.log("Gym ID:", gymId);
    } else {
      console.log("Failed to fetch gym:", data.message);
    }
  } catch (error) {
    console.log("Error fetching gym:", error);
  }

  if (!gymId) {
    console.log("No gym ID found");
    loadingState.style.display = "none";
    showErrorMessage("Unable to fetch gym information");
    return;
  }

  try {
    const response = await fetch(`/reviews/${gymId}`);
    const result = await response.json();

    loadingState.style.display = "none";

    if (!Array.isArray(result)) {
      console.error("Expected an array but got:", result);
      showErrorMessage("There was an error loading reviews.");
      return;
    }

    if (result.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    // Update statistics
    updateReviewStats(result);

    // Generate review HTML with enhanced design
    result.forEach((review, index) => {
      const authorInitial =
        review.user?.username?.charAt(0).toUpperCase() || "?";
      const reviewDate = new Date(
        review.createdAt || Date.now()
      ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const reviewHTML = `
        <div class="review" style="animation-delay: ${index * 0.1}s">
          <div class="review-header">
            <div class="review-author">
              <div class="author-avatar">${authorInitial}</div>
              <div class="author-info">
                <h4>${review.user?.username || "Anonymous"}</h4>
                <div class="review-date">${reviewDate}</div>
              </div>
            </div>
            <div class="review-rating">
              <span class="stars">${"★".repeat(review.rating)}</span>
              <span class="empty-stars">${"☆".repeat(5 - review.rating)}</span>
              <span class="rating-number">${review.rating}/5</span>
            </div>
          </div>
          <div class="review-comment">
            <p>${review.comment}</p>
          </div>
        </div>
      `;
      reviewList.innerHTML += reviewHTML;
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    loadingState.style.display = "none";
    showErrorMessage("There was an error fetching the reviews.");
  }
});

function updateReviewStats(reviews) {
  const totalReviews = reviews.length;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating =
    totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;
  const fiveStarCount = reviews.filter((review) => review.rating === 5).length;

  // Animate counters
  animateCounter("total-reviews", totalReviews);
  animateCounter("average-rating", averageRating, true);
  animateCounter("five-star-count", fiveStarCount);
}

function animateCounter(elementId, finalValue, isDecimal = false) {
  const element = document.getElementById(elementId);
  const startValue = 0;
  const duration = 1500;
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);

    const currentValue = startValue + (finalValue - startValue) * easeOutQuart;

    if (isDecimal) {
      element.textContent = currentValue.toFixed(1);
    } else {
      element.textContent = Math.floor(currentValue);
    }

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = isDecimal ? finalValue : finalValue;
    }
  }

  requestAnimationFrame(updateCounter);
}

function showErrorMessage(message) {
  const reviewList = document.getElementById("review-list");
  reviewList.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      ${message}
    </div>
  `;
}
