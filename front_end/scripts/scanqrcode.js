function getGymIdFromUrl() {
  const pathParts = window.location.pathname.split("/");
  return pathParts[pathParts.length - 1]; // Assumes last part is gymId
}

async function onScanSuccess(decodedText, decodedResult) {
  const resultElement = document.getElementById("result");
  const readerElement = document.getElementById("reader");

  // Display scanned result
  resultElement.innerHTML = `<strong>Member checked in:</strong> ${decodedText}`;
  resultElement.classList.add("success");

  // Show restart button
  document.getElementById("restart-button").style.display = "inline-block";

  // Visual feedback
  readerElement.style.boxShadow =
    "0 0 0 2px #4CAF50, 0 0 20px rgba(76, 175, 80, 0.5)";

  // Stop the scanner and clear the UI
  try {
    await html5QrcodeScanner.clear();
  } catch (err) {
    console.error("Failed to clear scanner:", err);
  }

  // Send check-in request to the server
  const gymId = getGymIdFromUrl();

  try {
    const response = await fetch("http://localhost:5000/routes/checkin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        memberId: decodedText,
        gymId: gymId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Check-in successful:", result);
  } catch (error) {
    resultElement.innerHTML = `<strong>Error:</strong> Could not check in member.`;
    resultElement.classList.add("error");
  }
}

function onScanError(errorMessage) {
  // You can comment this out if it's too spammy
  console.warn(`Scan error: ${errorMessage}`);
}

// Initialize the scanner
const html5QrcodeScanner = new Html5QrcodeScanner(
  "reader",
  {
    fps: 10,
    qrbox: 250,
  },
  false
);

html5QrcodeScanner.render(onScanSuccess, onScanError);

// Add animation to reader container
document.getElementById("reader-container").classList.add("active");

// Restart button reloads the page
document
  .getElementById("restart-button")
  .addEventListener("click", function () {
    location.reload();
  });
