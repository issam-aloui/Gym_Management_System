// Fix for map loading issues
document.addEventListener("DOMContentLoaded", function () {
  // Generate and append map HTML to the main content
  function generateMapHTML() {
    return `
      <div class="overlay hidden">
        <div class="map-container">
          <div id="filterContainer">
            <div class="filter">
              <label for="nameFilter">Search by Name:</label><br />
              <input type="text" id="nameFilter" placeholder="Enter gym name" /><br />
            </div>
            <div class="filter">
              <label for="townFilter">Search by Town:</label><br />
              <input type="text" id="townFilter" placeholder="Enter town name" />
            </div>
          </div>
          <div id="map"></div>
        </div>
      </div>
      <cta-button id="displayMap"><img src="../assets/icons/location.svg" alt=""></cta-button>
    `;
  }

  // Add map HTML to DOM first
  const content = document.getElementById("mainContent");
  content.innerHTML += generateMapHTML();

  // Set up event listeners for overlay and display button
  const overlay = document.querySelector(".overlay");
  const displayMap = document.getElementById("displayMap");

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.add("hidden");
      }
    });
  }

  if (displayMap) {
    displayMap.addEventListener("click", () => {
      overlay.classList.remove("hidden");

      // Load the map only when button is clicked
      if (!window.mapInitialized) {
        loadLeaflet();
      }
    });
  }

  // Load Leaflet CSS and JS only when needed
  function loadLeaflet() {
    if (!window.L) {
      const leafletCSS = document.createElement("link");
      leafletCSS.rel = "stylesheet";
      leafletCSS.href = "https://unpkg.com/leaflet/dist/leaflet.css";
      document.head.appendChild(leafletCSS);

      const leafletScript = document.createElement("script");
      leafletScript.src = "https://unpkg.com/leaflet/dist/leaflet.js";
      leafletScript.onload = () => {
        initMap();
        window.mapInitialized = true;
      };
      document.body.appendChild(leafletScript);
    } else {
      initMap();
      window.mapInitialized = true;
    }
  }

  function initMap() {
    if (!document.getElementById("map")) {
      console.error("Map container not found");
      return;
    }

    const map = L.map("map").setView([36.7538, 3.0588], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Add locate button to map controls
    setTimeout(() => {
      const zoomControlContainer = document.querySelector(
        ".leaflet-control-zoom"
      );
      if (zoomControlContainer) {
        const locateBtn = document.createElement("a");
        locateBtn.className = "leaflet-control-zoom-in";
        locateBtn.innerHTML =
          "<img src='../assets/icons/locate.svg' alt='Locate'>";
        locateBtn.title = "Locate Me";
        locateBtn.style.cursor = "pointer";

        locateBtn.onclick = locateUser;
        zoomControlContainer.appendChild(locateBtn);
      }
    }, 300); // Short delay to ensure controls are rendered

    const markers = new Map();
    let userMarker = null;
    let debounceTimeout = null;

    function clearMarkers() {
      markers.forEach((marker) => map.removeLayer(marker));
      markers.clear();
    }

    function locateUser() {
      if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          map.setView([coords.latitude, coords.longitude], 13);

          if (userMarker) {
            map.removeLayer(userMarker);
          }

          userMarker = L.marker([coords.latitude, coords.longitude])
            .addTo(map)
            .bindPopup("You are here")
            .openPopup();
        },
        () => alert("Unable to get your location")
      );
    }

    async function loadGyms() {
      try {
        const res = await fetch("/gym/getgyms");
        const gyms = await res.json();
        displayGyms(gyms);

        const townFilter = document.getElementById("townFilter").value.trim();
        if (townFilter) {
          const coords = await geocodeTown(townFilter);
          if (coords) {
            map.setView([coords.lat, coords.lng], 13);
          }
        }
      } catch (err) {
        console.error("Failed to load gyms:", err);
        // Provide fallback data for testing when API fails
        const testGyms = [
          {
            _id: "1",
            name: "FitZone",
            town: "Algiers",
            coordinates: { lat: 36.7639, lng: 3.0738 },
          },
          {
            _id: "2",
            name: "PowerGym",
            town: "Oran",
            coordinates: { lat: 36.7538, lng: 3.0388 },
          },
        ];
        displayGyms(testGyms);
      }
    }

    function displayGyms(gyms) {
      clearMarkers();
      const nameFilter =
        document.getElementById("nameFilter")?.value.toLowerCase() || "";
      const townFilter =
        document.getElementById("townFilter")?.value.toLowerCase() || "";

      gyms.forEach((gym) => {
        const { lat, lng } = gym.coordinates || {};
        const nameMatch =
          !nameFilter || gym.name.toLowerCase().includes(nameFilter);
        const townMatch =
          !townFilter ||
          (gym.town &&
            gym.town
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .includes(
                townFilter.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
              ));

        if (lat && lng && nameMatch && townMatch) {
          const marker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(
              `<strong>${gym.name}</strong><br>Town: ${gym.town || "N/A"}`
            );
          markers.set(gym._id, marker);
        }
      });
    }

    async function geocodeTown(townName) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            townName
          )}`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          };
        }
        return null;
      } catch (err) {
        console.error("Geocoding failed:", err);
        return null;
      }
    }

    function debounceLoadGyms() {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        loadGyms();
      }, 500);
    }

    // Add event listeners to filter inputs
    const nameFilter = document.getElementById("nameFilter");
    const townFilter = document.getElementById("townFilter");

    if (nameFilter) nameFilter.addEventListener("input", debounceLoadGyms);
    if (townFilter) townFilter.addEventListener("input", debounceLoadGyms);

    // Initial gym load
    loadGyms();
  }
});
