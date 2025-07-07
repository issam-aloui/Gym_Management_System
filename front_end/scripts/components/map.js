// Fix for map loading issues
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
    <cta-button id="displayMap"><img src="../../assets/icons/location.svg" alt=""></cta-button>
  `;
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
        lat: Number.parseFloat(data[0].lat),
        lng: Number.parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
}
document.addEventListener("DOMContentLoaded", function () {
  // Generate and append map HTML to the main content
  const cta_button_script = document.createElement("script");
  cta_button_script.src = "../../scripts/components/button.js";
  document.body.append(cta_button_script);

  // Add map HTML to DOM first
  const content = document.querySelector("#mainContent");
  content.innerHTML += generateMapHTML();

  // Set up event listeners for overlay and display button
  const overlay = document.querySelector(".overlay");
  const displayMap = document.querySelector("#displayMap");

  if (overlay) {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        overlay.classList.add("hidden");
      }
    });
  }

  if (displayMap) {
    displayMap.addEventListener("click", () => {
      overlay.classList.remove("hidden");

      // Load the map only when button is clicked
      if (!globalThis.mapInitialized) {
        loadLeaflet();
      }
    });
  }

  // Load Leaflet CSS and JS only when needed
  function loadLeaflet() {
    if (globalThis.L) {
      initMap();
      globalThis.mapInitialized = true;
    } else {
      const leafletCSS = document.createElement("link");
      leafletCSS.rel = "stylesheet";
      leafletCSS.href = "https://unpkg.com/leaflet/dist/leaflet.css";
      document.head.append(leafletCSS);

      const leafletScript = document.createElement("script");
      leafletScript.src = "https://unpkg.com/leaflet/dist/leaflet.js";
      leafletScript.addEventListener("load", () => {
        initMap();
        globalThis.mapInitialized = true;
      });
      document.body.append(leafletScript);
    }
  }

  function initMap() {
    if (!document.querySelector("#map")) {
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
        const locateButton = document.createElement("a");
        locateButton.className = "leaflet-control-zoom-in";
        locateButton.innerHTML =
          "<img src='../../assets/icons/locate.svg' alt='Locate'>";
        locateButton.title = "Locate Me";
        locateButton.style.cursor = "pointer";

        locateButton.addEventListener("click", locateUser);
        zoomControlContainer.append(locateButton);
      }
    }, 300); // Short delay to ensure controls are rendered

    const markers = new Map();
    let userMarker;
    let debounceTimeout;

    function clearMarkers() {
      for (const marker of markers) map.removeLayer(marker);
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
        const response = await fetch("/gym/getgyms");
        const gyms = await response.json();
        displayGyms(gyms);

        const townFilter = document.querySelector("#townFilter").value.trim();
        if (townFilter) {
          const coords = await geocodeTown(townFilter);
          if (coords) {
            map.setView([coords.lat, coords.lng], 13);
          }
        }
      } catch (error) {
        console.error("Failed to load gyms:", error);
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
        document.querySelector("#nameFilter")?.value.toLowerCase() || "";
      const townFilter =
        document.querySelector("#townFilter")?.value.toLowerCase() || "";

      for (const gym of gyms) {
        const { lat, lng } = gym.coordinates || {};
        const nameMatch =
          !nameFilter || gym.name.toLowerCase().includes(nameFilter);
        const townMatch =
          !townFilter ||
          (gym.town &&
            gym.town
              .toLowerCase()
              .normalize("NFD")
              .replaceAll(/[\u0300-\u036F]/g, "")
              .includes(
                townFilter.normalize("NFD").replaceAll(/[\u0300-\u036F]/g, "")
              ));

        if (lat && lng && nameMatch && townMatch) {
          const marker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(
              `<strong>${gym.name}</strong><br>Town: ${gym.town || "N/A"}`
            );
          markers.set(gym._id, marker);
        }
      }
    }

    

    function debounceLoadGyms() {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        loadGyms();
      }, 500);
    }

    // Add event listeners to filter inputs
    const nameFilter = document.querySelector("#nameFilter");
    const townFilter = document.querySelector("#townFilter");

    if (nameFilter) nameFilter.addEventListener("input", debounceLoadGyms);
    if (townFilter) townFilter.addEventListener("input", debounceLoadGyms);

    // Initial gym load
    loadGyms();
  }
});
