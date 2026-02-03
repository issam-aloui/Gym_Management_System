async function onScanSuccess(decodedText, decodedResult) {
  const resultElement = document.querySelector("#result");
  const readerElement = document.querySelector("#reader");

  // Display scanned result
  resultElement.innerHTML = `<strong>Member checked in:</strong> ${decodedText}`;
  resultElement.classList.add("success");

  // Show restart button
  document.querySelector("#restart-button").style.display = "inline-block";

  // Visual feedback
  readerElement.style.boxShadow =
    "0 0 0 2px #4CAF50, 0 0 20px rgba(76, 175, 80, 0.5)";

  // Stop the scanner and clear the UI
  try {
    await html5QrcodeScanner.clear();
  } catch (error) {
    console.error("Failed to clear scanner:", error);
  }

  try {
    const response = await fetch("/gym/getgym", {
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

  try {
    const response = await fetch("/scan/checkin", {
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
    resultElement.innerHTML = "<strong>Done:</strong> member checked.";
  } catch {
    resultElement.innerHTML =
      "<strong>Error:</strong> Could not check in member.";
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
  false,
);

html5QrcodeScanner.render(onScanSuccess, onScanError);

// Add animation to reader container
document.querySelector("#reader-container").classList.add("active");

// Restart button reloads the page
document
  .querySelector("#restart-button")
  .addEventListener("click", function () {
    location.reload();
  });
