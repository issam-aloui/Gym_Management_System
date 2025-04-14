customElements.define(
  "app-layout",
  class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <header>
          <div class="menu-icon" id="menuToggle">
            <img src="../assets/icons/Shape.svg" alt="menu-icon">
          </div>
          <div class="search-container">
            <img src="../assets/icons/search.png" alt="search" class="search-icon">
            <input type="search" placeholder="Search" class="search-bar">
          </div>
          <div class="user-info">
            <div class="notification-icon">
              <img src="../assets/icons/noti.svg" alt="notifications">
            </div>
            <div class="user-pfp">
              <img src="../assets/icons/pfp.png" alt="user pfp">
            </div>
            <div class="user-details">
              <h3 class="user-name">username</h3>
              <p class="user-type">Gym User</p>
            </div>
          </div>
        </header>
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-container">
            <nav>
              <ul>
                <li><a href="#" class="nav-home active">
                  <img src="../assets/icons/home.svg" alt="Home" />
                  <span>Home</span>
                </a></li>
                <li><a href="#" class="nav-workout">
                  <img src="../assets/icons/Membership.svg" alt="Workout" />
                  <span>Workout</span>
                </a></li>
                <li><a href="#" class="nav-profile">
                  <img src="../assets/icons/classes.svg" alt="Profile" />
                  <span>Profile</span>
                </a></li>
                <li><a href="#" class="nav-progress">
                  <img src="../assets/icons/shart.svg" alt="Progress" />
                  <span>Progress</span>
                </a></li>
              </ul>
            </nav>
            <div class="Settings">
              <nav>
                <ul>
                  <li>
                    <a href="#">
                      <img src="../assets/icons/settings.svg" alt="Settings" />
                      <span>Settings</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </aside>
      `;

      // Sidebar toggle
      document.getElementById("menuToggle").addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("expanded");
        document.getElementById("mainContent").classList.toggle("shifted");
      });

      this.setupNavigation();
      this.loadHome(); // Load Home (gym map) by default
    }

    setupNavigation() {
      const links = this.querySelectorAll("aside nav ul li a");
      links.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          links.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");

          const section = link.classList[0].replace("nav-", "");
          switch (section) {
            case "home":
              this.loadHome();
              break;
            default:
              this.loadSection(section);
              break;
          }
        });
      });
    }

    loadSection(sectionName) {
      document.getElementById("mainContent").innerHTML = `
        <h2>${
          sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
        } Section</h2>
        <p>This section is under construction.</p>
      `;
    }

    async loadHome() {
      const content = document.getElementById("mainContent");
      content.innerHTML = `
        <div id="filterContainer">
          <label for="nameFilter">Search by Name:</label><br />
          <input type="text" id="nameFilter" placeholder="Enter gym name" /><br />
          <label for="townFilter">Search by Town:</label><br />
          <input type="text" id="townFilter" placeholder="Enter town name" />
        </div>
        <div id="map" style="width: 100%; height: 90vh;"></div>
      `;

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

    initMap() {
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

      locateUser();
      loadGyms();
    }
  }
);
