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
  `;
}

async function loadMap() {
  const content = document.getElementById("mainContent");
  content.innerHTML += generateMapHTML();

  // Dynamically load Leaflet
  if (!window.L) {
    const leafletCSS = document.createElement("link");
    leafletCSS.rel = "stylesheet";
    leafletCSS.href = "https://unpkg.com/leaflet/dist/leaflet.css";
    document.head.appendChild(leafletCSS);

    const leafletScript = document.createElement("script");
    leafletScript.src = "https://unpkg.com/leaflet/dist/leaflet.js";
    leafletScript.onload = () => this.initMap();
    document.body.appendChild(leafletScript);
  } else {
    this.initMap();
  }
}

function initMap() {
  const map = L.map("map").setView([36.7538, 3.0588], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
  const zoomControlContainer = document.querySelector(".leaflet-control-zoom");

  const locateBtn = document.createElement("a");
  locateBtn.className = "leaflet-control-zoom-in"; // optional for same style
  locateBtn.innerHTML = "<img src='../assets/icons/locate.svg'>" // or use an icon
  locateBtn.title = "Locate Me";
  locateBtn.style.cursor = "pointer";

  locateBtn.onclick = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        map.setView([coords.latitude, coords.longitude], 13);
        L.marker([coords.latitude, coords.longitude])
          .addTo(map)
          .bindPopup("You are here")
          .openPopup();
      },
      () => alert("Unable to get your location")
    );
  };

  zoomControlContainer.appendChild(locateBtn);
  const markers = new Map();
  let userMarker = null;
  let debounceTimeout = null;

  function clearMarkers() {
    markers.forEach((marker) => map.removeLayer(marker));
    markers.clear();
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
      alert("Error loading gyms");
    }
  }

  function displayGyms(gyms) {
    clearMarkers();
    const nameFilter = document
      .getElementById("nameFilter")
      .value.toLowerCase();
    const townFilter = document
      .getElementById("townFilter")
      .value.toLowerCase();

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

  function locateUser() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (userMarker) {
          map.removeLayer(userMarker);
        }

        userMarker = L.marker([latitude, longitude], {
          icon: L.icon({
            iconUrl:
              "https://upload.wikimedia.org/wikipedia/commons/8/88/Map_marker.svg",
            iconSize: [27, 43], // Width, height
            iconAnchor: [13, 41], // Position relative to the icon's tip
            popupAnchor: [0, -38],
          }),
        })
          .addTo(map)
          .bindPopup("You")
          .openPopup();

        map.setView([latitude, longitude], 13);
      },
      () => {
        alert("Unable to retrieve your location.");
      }
    );
  }

  // Event listeners for filters
  document
    .getElementById("nameFilter")
    .addEventListener("input", debounceLoadGyms);
  document
    .getElementById("townFilter")
    .addEventListener("input", debounceLoadGyms);


    loadGyms();

}

loadMap();

const overlay = document.querySelector(".overlay");

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.classList.add("hidden");
  }
});
const displayMap = document.getElementById("displayMap");
displayMap.addEventListener("click", () => {
  overlay.classList.remove("hidden");
});
