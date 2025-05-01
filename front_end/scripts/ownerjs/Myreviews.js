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
      console.log("Gym ID:", gymId);
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
           <div class="review-rating">${"★".repeat(review.rating)}${"☆".repeat(
        5 - review.rating
      )}</div>
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
