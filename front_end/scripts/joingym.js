// Enhanced Join Gym JavaScript with Reviews Integration
document.addEventListener("DOMContentLoaded", () => {
  let gymData = null;
  let reviewsData = null;

  // Utility functions
  function getGymIdFromUrl() {
    const parts = window.location.pathname.split("/");
    return parts[2] || null;
  }

  function showLoading(element) {
    element.style.opacity = "0.6";
    element.style.pointerEvents = "none";
  }

  function hideLoading(element) {
    element.style.opacity = "1";
    element.style.pointerEvents = "auto";
  }

  function showError(message) {
    const messageContainer = document.getElementById("message");
    if (messageContainer) {
      messageContainer.textContent = message;
      messageContainer.className = "message-container error";
      setTimeout(() => {
        messageContainer.style.display = "none";
      }, 5000);
    }
  }

  function showSuccess() {
    const modal = document.getElementById("successModal");
    if (modal) {
      modal.style.display = "flex";
      modal.offsetHeight; // Force reflow
      modal.classList.add("show");
    }
  }

  function hideSuccess() {
    const modal = document.getElementById("successModal");
    if (modal) {
      modal.classList.remove("show");
      setTimeout(() => {
        modal.style.display = "none";
      }, 300);
    }
  }

  // Page loader functions
  function showPageLoader() {
    const loader = document.getElementById("pageOverlay");
    if (loader) {
      loader.style.display = "flex";
    }
  }

  function hidePageLoader() {
    const loader = document.getElementById("pageOverlay");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
      }, 300);
    }
  }

  // Load gym information
  async function loadGymInfo() {
    const gymId = getGymIdFromUrl();
    if (!gymId) {
      hidePageLoader();
      showError("Invalid gym ID in URL");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/gym/${gymId}/details`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        gymData = await response.json();
        updateGymInfoDisplay();
      } else {
        console.error("Failed to load gym information");
        setDefaultGymInfo();
      }
    } catch (error) {
      console.error("Error loading gym info:", error);
      setDefaultGymInfo();
    } finally {
      hidePageLoader();
    }
  }

  // Load reviews
  async function loadReviews() {
    const gymId = getGymIdFromUrl();
    if (!gymId) return;

    try {
      const response = await fetch(`http://localhost:5000/reviews/${gymId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        reviewsData = await response.json();
        updateReviewsDisplay();
      } else {
        console.error("Failed to load reviews");
        showNoReviews();
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      showNoReviews();
    } finally {
      hideReviewsLoading();
    }
  }
  function updateGymInfoDisplay() {
    if (!gymData) return;

    // Update gym name
    const gymNameElement = document.getElementById("gymName");
    if (gymNameElement) {
      gymNameElement.textContent = gymData.name || "Gym Name";
    }

    // Update gym location
    const gymLocationElement = document.querySelector("#gymLocation span");
    if (gymLocationElement) {
      gymLocationElement.textContent = gymData.town || "Location not available";
    }

    // Update gym price
    const gymPriceElement = document.querySelector("#gymPrice span");
    if (gymPriceElement) {
      gymPriceElement.textContent = gymData.pricePerMonth
        ? `$${gymData.pricePerMonth}/month`
        : "Price available on request";
    }

    // Update contact info (if displayed)
    const gymContactElement = document.querySelector("#gymContact");
    if (gymContactElement && gymData.contact) {
      gymContactElement.textContent =
        gymData.contact.email ||
        gymData.contact.phonenumber ||
        "Contact not available";
    } // Update member count with actual data
    const memberCountElement = document.getElementById("memberCount");
    if (memberCountElement) {
      memberCountElement.textContent = gymData.memberCount || "0";
    }

    const ratingElement = document.getElementById("rating");
    if (ratingElement) {
      ratingElement.textContent = "N/A";
    }

    // Update page title
    document.title = `Join ${gymData.name || "Gym"} - Gym Management System`;
  }

  function setDefaultGymInfo() {
    const gymNameElement = document.getElementById("gymName");
    const gymLocationElement = document.querySelector("#gymLocation span");
    const gymPriceElement = document.querySelector("#gymPrice span");
    const memberCountElement = document.getElementById("memberCount");
    const ratingElement = document.getElementById("rating");

    if (gymNameElement) gymNameElement.textContent = "Gym Name";
    if (gymLocationElement)
      gymLocationElement.textContent = "Location not available";
    if (gymPriceElement)
      gymPriceElement.textContent = "Price available on request";
    if (memberCountElement) memberCountElement.textContent = "0";
    if (ratingElement) ratingElement.textContent = "N/A";
  }

  // Reviews Display Functions
  function updateReviewsDisplay() {
    if (!reviewsData || reviewsData.length === 0) {
      showNoReviews();
      return;
    }

    updateReviewsOverview();
    renderReviewsList();
  }

  function updateReviewsOverview() {
    const reviewCount = reviewsData.length;
    const totalRating = reviewsData.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const avgRating =
      reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;

    // Update overall rating display
    const overallRatingElement = document.getElementById("overallRating");
    const totalReviewsElement = document.getElementById("totalReviews");
    const reviewCountElement = document.getElementById("reviewCount");
    const overallStarsElement = document.getElementById("overallStars");

    if (overallRatingElement) overallRatingElement.textContent = avgRating;
    if (totalReviewsElement) totalReviewsElement.textContent = reviewCount;
    if (reviewCountElement) reviewCountElement.textContent = reviewCount;

    // Update star display
    if (overallStarsElement) {
      updateStarDisplay(overallStarsElement, parseFloat(avgRating));
    }
  }

  function renderReviewsList() {
    const reviewsList = document.getElementById("reviewsList");
    if (!reviewsList) return;

    reviewsList.innerHTML = "";

    reviewsData.forEach((review) => {
      const reviewElement = createReviewElement(review);
      reviewsList.appendChild(reviewElement);
    });
  }

  function createReviewElement(review) {
    const reviewDiv = document.createElement("div");
    reviewDiv.className = "review-item";

    const userName = review.user?.username || "Anonymous User";
    const userInitial = userName.charAt(0).toUpperCase();
    const reviewDate = new Date(review.createdAt).toLocaleDateString();

    reviewDiv.innerHTML = `
      <div class="review-header">
        <div class="review-user">
          <div class="user-avatar">
            ${userInitial}
          </div>
          <div class="user-info">
            <h4>${userName}</h4>
            <span class="review-date">${reviewDate}</span>
          </div>
        </div>
        <div class="review-rating">
          ${generateStarRating(review.rating)}
        </div>
      </div>
      <div class="review-comment">
        ${review.comment || "No comment provided."}
      </div>
    `;

    return reviewDiv;
  }

  function generateStarRating(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += '<i class="fas fa-star"></i>';
      } else {
        stars += '<i class="far fa-star"></i>';
      }
    }
    return stars;
  }

  function updateStarDisplay(container, rating) {
    const stars = container.querySelectorAll("i");
    stars.forEach((star, index) => {
      if (index < rating) {
        star.className = "fas fa-star";
      } else {
        star.className = "far fa-star";
      }
    });
  }

  function hideReviewsLoading() {
    const loadingElement = document.getElementById("reviewsLoading");
    if (loadingElement) {
      loadingElement.style.display = "none";
    }
  }

  function showNoReviews() {
    hideReviewsLoading();
    const noReviewsElement = document.getElementById("noReviews");
    const reviewsList = document.getElementById("reviewsList");
    const reviewsOverview = document.getElementById("reviewsOverview");

    if (noReviewsElement) noReviewsElement.style.display = "block";
    if (reviewsList) reviewsList.style.display = "none";
    if (reviewsOverview) reviewsOverview.style.display = "none";
  }

  // Character counter functionality
  function setupCharacterCounter() {
    const descriptionTextarea = document.getElementById("description");
    const charCounter = document.getElementById("charCount");

    if (descriptionTextarea && charCounter) {
      const maxLength = 500;

      descriptionTextarea.addEventListener("input", () => {
        const currentLength = descriptionTextarea.value.length;
        charCounter.textContent = currentLength;

        // Update counter color based on usage
        if (currentLength > maxLength * 0.9) {
          charCounter.style.color = "#e74c3c";
        } else if (currentLength > maxLength * 0.7) {
          charCounter.style.color = "#f39c12";
        } else {
          charCounter.style.color = "#7f8c8d";
        }
      });
    }
  }

  // Password toggle functionality
  function setupPasswordToggle() {
    const passwordInput = document.getElementById("gym-password");
    const toggleBtn = document.getElementById("passwordToggle");

    if (passwordInput && toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const type =
          passwordInput.getAttribute("type") === "password"
            ? "text"
            : "password";
        passwordInput.setAttribute("type", type);

        const icon = toggleBtn.querySelector("i");
        if (icon) {
          icon.className =
            type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
        }
      });
    }
  }

  // Real-time validation
  function setupRealTimeValidation() {
    const fullNameInput = document.getElementById("full-name");
    const passwordInput = document.getElementById("gym-password");

    if (fullNameInput) {
      fullNameInput.addEventListener("input", () => {
        const value = fullNameInput.value.trim();
        const isValid = value.length >= 2;

        fullNameInput.style.borderColor = isValid ? "#27ae60" : "#e74c3c";

        if (!isValid && value.length > 0) {
          showFieldError(fullNameInput, "Name must be at least 2 characters");
        } else {
          hideFieldError(fullNameInput);
        }
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener("input", () => {
        const value = passwordInput.value.trim();
        const isValid = value.length >= 1;

        passwordInput.style.borderColor = isValid ? "#27ae60" : "#e74c3c";

        if (!isValid && value.length > 0) {
          showFieldError(passwordInput, "Password is required");
        } else {
          hideFieldError(passwordInput);
        }
      });
    }
  }

  function showFieldError(field, message) {
    let errorSpan = field.parentNode.querySelector(".field-error");
    if (!errorSpan) {
      errorSpan = document.createElement("span");
      errorSpan.className = "field-error";
      errorSpan.style.color = "#e74c3c";
      errorSpan.style.fontSize = "0.8rem";
      errorSpan.style.marginTop = "0.25rem";
      errorSpan.style.display = "block";
      field.parentNode.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
  }

  function hideFieldError(field) {
    const errorSpan = field.parentNode.querySelector(".field-error");
    if (errorSpan) {
      errorSpan.remove();
    }
  }

  // Form validation
  function validateForm() {
    const fullName = document.getElementById("full-name").value.trim();
    const password = document.getElementById("gym-password").value.trim();
    const gymId = getGymIdFromUrl();

    if (!gymId) {
      showError("Invalid gym ID");
      return false;
    }

    if (!fullName || fullName.length < 2) {
      showError("Full name must be at least 2 characters");
      return false;
    }

    if (!password) {
      showError("Gym password is required");
      return false;
    }

    return true;
  }

  // Form submission
  async function handleFormSubmission(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const form = document.getElementById("join-form");
    const submitBtn = document.getElementById("submitBtn");
    const btnText = submitBtn.querySelector(".btn-text");
    const btnLoading = submitBtn.querySelector(".btn-loading");
    const fullName = document.getElementById("full-name").value.trim();
    const description = document.getElementById("description").value.trim();
    const password = document.getElementById("gym-password").value.trim();
    const gymId = getGymIdFromUrl();

    // Show loading state
    showLoading(form);
    if (submitBtn && btnText && btnLoading) {
      btnText.style.display = "none";
      btnLoading.style.display = "flex";
      submitBtn.disabled = true;
    }

    try {
      const response = await fetch("http://localhost:5000/joingym/memreq", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gymId, fullName, description, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess();
      } else {
        showError(data.error || "Failed to send join request");
      }
    } catch (err) {
      console.error("Network error:", err);
      showError("Network error. Please check your connection and try again.");
    } finally {
      // Hide loading state
      hideLoading(form);
      if (submitBtn && btnText && btnLoading) {
        btnText.style.display = "flex";
        btnLoading.style.display = "none";
        submitBtn.disabled = false;
      }
    }
  }

  // Initialize all functionality
  function init() {
    const form = document.getElementById("join-form");

    if (!form) {
      console.error("❌ Form with id 'join-form' not found!");
      return;
    }

    // Load gym information and reviews
    loadGymInfo();
    loadReviews();

    // Setup all interactive features
    setupCharacterCounter();
    setupPasswordToggle();
    setupRealTimeValidation();

    // Add form submission handler
    form.addEventListener("submit", handleFormSubmission);

    console.log(
      "✅ Enhanced gym join page with reviews initialized successfully"
    );
  }

  // Start initialization
  init();
});

// Global functions for modal (referenced in HTML)
function redirectToHome() {
  window.location.href = "/home-user";
}

function closeModal() {
  const modal = document.getElementById("successModal");
  if (modal) {
    modal.style.display = "none";
  }
}
