globalThis.addEventListener("DOMContentLoaded", async () => {
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

    document.querySelector("#userName").textContent = user.username || "N/A";
    document.querySelector("#userId").textContent = `#${user.id ?? "??"}`;
    document.querySelector("#userPhone").textContent = "GymFit";
    document.querySelector("#userEmail").textContent = user.email || "N/A";
    document.querySelector("#userAddress").textContent ="algeria";

    // Set QR code from user.qrcode directly
    document.querySelector("#qrImage").src = user.qrcode || "";
    document.querySelector("#downloadLink").href = user.qrcode || "";
    document.querySelector("#downloadLink").download = "downloaded-image.png";

  } catch (error) {
    console.error("Error loading user info:", error);
    document.querySelector("#userName").textContent = "Error";
  }
});
