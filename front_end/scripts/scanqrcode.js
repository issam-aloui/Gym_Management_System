const logger = require("../../back_end/utils/logger");

function getGymIdFromUrl() {
  const pathParts = window.location.pathname.split('/');
  return pathParts[pathParts.length - 1]; // This assumes last part is gymId
}



async function onScanSuccess(decodedText, decodedResult) {
  // Animation for scan success
  const resultElement = document.getElementById('result');
  resultElement.innerHTML = `<strong>Member checked in:</strong> ${decodedText}`;
  resultElement.classList.add('success');
  
  // Show restart button
  document.getElementById('restart-button').style.display = 'inline-block';
  
  // Add success animation to reader
  document.getElementById('reader').style.boxShadow = '0 0 0 2px #4CAF50, 0 0 20px rgba(76, 175, 80, 0.5)';
  
  // Stop scanning
  html5QrcodeScanner.clear();

  const gymId = getGymIdFromUrl();

  const response = await fetch("http://localhost:5000/routes/checkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decodedText })
   });

}

function onScanError(errorMessage) {
  logger.error(`Failed to scan Qr code: ${errorMessage}`);
}

const html5QrcodeScanner = new Html5QrcodeScanner(
  "reader",
  { fps: 10, qrbox: 250 },
  false
);

html5QrcodeScanner.render(onScanSuccess, onScanError);

// Add animation to reader container
document.getElementById('reader-container').classList.add('active');

// Restart button functionality
document.getElementById('restart-button').addEventListener('click', function() {
  location.reload();
});