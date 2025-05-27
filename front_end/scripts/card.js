window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("http://localhost:5000/user/getinfo", {
      method: "POST",
      credentials: "include", // send cookies
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info.");
    }

    const user = await response.json();

    document.getElementById("userName").textContent = user.username || "N/A";
    document.getElementById("userId").textContent = `#${user.id ?? "??"}`;
    document.getElementById("userPhone").textContent = "GymFit";
    document.getElementById("userEmail").textContent = user.email || "N/A";
    document.getElementById("userAddress").textContent ="algeria";

    // Set QR code from user.qrcode directly
    document.getElementById("qrImage").src = user.qrcode || "";
    document.getElementById("downloadLink").href = user.qrcode || "";
    document.getElementById("downloadLink").download = "downloaded-image.png";

  } catch (error) {
    console.error("Error loading user info:", error);
    document.getElementById("userName").textContent = "Error";
  }
});
