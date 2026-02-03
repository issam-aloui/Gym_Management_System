// API Configuration - dynamically loaded from server
let API_BASE_URL = "http://localhost:5000"; // Default fallback

// Fetch config from server
(async function initConfig() {
  try {
    const response = await fetch("/api/config");
    const config = await response.json();
    API_BASE_URL = config.BASE_URL;
  } catch (error) {
    console.warn("Failed to load API config, using default:", API_BASE_URL);
  }
})();

// Helper function to build API URLs
function getApiUrl(path) {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = { getApiUrl, API_BASE_URL };
}
