const map = L.map("map").setView([36.7538, 3.0588], 12); 

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

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

    displayGyms(gyms); // Always filter gyms first

    const townFilter = document.getElementById("townFilter").value.trim();
    if (townFilter) {
      const coords = await geocodeTown(townFilter);
      if (coords) {
        map.setView([coords.lat, coords.lng], 13); // Recenter after filtering
      }
    }
  } catch (err) {
    console.error("Failed to load gyms:", err);
    alert("Error loading gyms");
  }
}

function displayGyms(gyms) {
  clearMarkers();

  const nameFilter = document.getElementById("nameFilter").value.toLowerCase();
  const townFilter = document.getElementById("townFilter").value.toLowerCase();

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
        .bindPopup(`<strong>${gym.name}</strong><br>Town: ${gym.town || "N/A"}`);
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
        title: "You",
        icon: L.icon({
          iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        }),
      })
        .addTo(map)
        .bindPopup("<strong>You</strong>")
        .openPopup();

      map.setView([latitude, longitude], 14);
    },
    (err) => {
      console.error("Geolocation error:", err);
      alert("Unable to retrieve your location.");
    }
  );
}

// Hook input events
document
  .getElementById("nameFilter")
  .addEventListener("input", debounceLoadGyms);
document
  .getElementById("townFilter")
  .addEventListener("input", debounceLoadGyms);

// Initial load
window.onload = () => {
  locateUser();
  loadGyms();
};
