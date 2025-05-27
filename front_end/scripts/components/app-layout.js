customElements.define(
  "app-layout",
  class extends HTMLElement {
    connectedCallback() {
      const role = this.getAttribute("role");
      const username = this.getAttribute("username");
      const announcements = this.getAttribute("announcements");

      let parsedAnnouncements = [];
      if (announcements) {
        try {
          parsedAnnouncements = JSON.parse(announcements);
        } catch (e) {
          console.error("Error parsing announcements:", e);
        }
      }

      this.innerHTML = `
        <header>
          <div class="menu-icon" id="menuToggle">
            <img src="../../assets/icons/menu.png" alt="menu-icon">
          </div>
          <div class="search-container">
            <img src="../../assets/icons/search.png" alt="search" class="search-icon">
            <input type="search" placeholder="Search" class="search-bar" id="searchInput">
          </div>
          <div class="user-info">
            <div class="notification-icon" id="notificationToggle">
              <img src="../../assets/icons/notif.svg" alt="notifications">
              ${
                parsedAnnouncements.length > 0
                  ? `<span class="notification-badge">${parsedAnnouncements.length}</span>`
                  : ""
              }
            </div>
            <div class="user-pfp">
              <img src="../../assets/icons/pfp.png" alt="user pfp">
            </div>
            <div class="user-details">
              <h3 class="user-name">${username || "username"}</h3>
              <p class="user-type">${
                role === "owner" ? "Gym Owner" : "Gym User"
              }</p>
            </div>
          </div>
        </header>

        <!-- Notification Bar -->
        <div class="notification-bar" id="notificationBar">
          <div class="notification-header">
            <h3>Recent Announcements</h3>
            <button class="close-btn" id="closeNotifications">&times;</button>
          </div>
          <div class="notification-content">
            ${
              parsedAnnouncements.length > 0
                ? parsedAnnouncements
                    .map(
                      (announcement) => `
                <div class="announcement-item">
                  <div class="announcement-gym">${
                    announcement.gymname || "Unknown Gym"
                  }</div>
                  <div class="announcement-title">${announcement.title}</div>
                  <div class="announcement-yap">${announcement.yap}</div>
                  <div class="announcement-date">${new Date(
                    announcement.createdAt
                  ).toLocaleDateString()}</div>
                </div>
              `
                    )
                    .join("")
                : '<div class="no-announcements">No recent announcements</div>'
            }
          </div>
        </div>









        
        <aside class="sidebar" id="sidebar">//nigger
          <div class="sidebar-container">
            <nav>
              <ul>
                <!-- USER PAGES -->
                <li class="nav-group">
                  <details open>
                    <summary data-tooltip="User Pages">
                      <img src="../../assets/icons/user-group.svg" alt="User Pages" />
                      <span>User Pages</span>
                    </summary>
                    <ul>
                      <li><a href="/home-user">
                        <img src="../../assets/icons/home.svg" alt="Home" />
                        <span>Home</span>
                      </a></li>
                      <li><a href="/memerships">
                        <img src="../../assets/icons/Membership.svg" alt="Membership" />
                        <span>My Membership</span>
                      </a></li>
                      <li><a href="/classes">
                        <img src="../../assets/icons/classes.svg" alt="Classes" />
                        <span>My Classes</span>
                      </a></li>
                      ${
                        role !== "owner"
                          ? `
    <li><a href="/creategym">
      <img src="../../assets/icons/shart.svg" alt="Be an Owner" />
      <span>Be an Owner</span>
    </a></li>
  `
                          : ""
                      }
                    </ul>
                  </details>
                </li>

                ${
                  role === "owner"
                    ? `
                <!-- OWNER PAGES -->
                
                <li class="nav-group">
                  <details open>
                    <summary data-tooltip="Owner Pages">
                      <img src="../../assets/icons/owner-group.svg" alt="Owner Pages" />
                      <span>Owner Pages</span>
                    </summary>
                    <ul>
                      <li><a href="/owner/myGym">
                        <img src="../../assets/icons/gym.svg" alt="My Gym" />
                        <span>My Gym</span>
                      </a></li>
                      <li><a href="/owner/members">
                        <img src="../../assets/icons/users.svg" alt="My Members" />
                        <span>My Members</span>
                      </a></li>
                      <li><a href="/owner/dashboard">
                     <img src="../../assets/icons/dashboard.svg" alt="Dashboard" />
                      <span>Dashboard</span>
                       </a></li>
                      <li><a href="/owner/Myreviews">
                        <img src="../../assets/icons/star.svg" alt="My Reviews" />
                        <span>My Reviews</span>
                      </a></li>
                      <li><a href="/owner/Myannoucements">
                        <img src="../../assets/icons/announce.svg" alt="Announcements" />
                        <span>My Announcements</span>
                      </a></li>
                      <li><a href="/owner/scanqrcode">
                        <img src="../../assets/icons/qr.svg" alt="QR Code" />
                        <span>Scan QR</span>
                      </a></li>
                    </ul>
                  </details>
                </li>
                `
                    : ""
                }
              </ul>
            </nav>

            <!-- SETTINGS -->
            <div class="Settings">
              <nav>
                <ul>
                  <li>
                    <a href="/settings" class="nav-settings">
                      <img src="../../assets/icons/settings.svg" alt="Settings" />
                      <span>Settings</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </aside>
      `;

      this.setupEventListeners();
    }

    setupEventListeners() {
      document.getElementById("menuToggle").addEventListener("click", () => {
        const sidebar = document.getElementById("sidebar");
        sidebar.classList.toggle("expanded");

        const main = document.getElementById("mainContent");
        if (main) main.classList.toggle("shifted");
      });

      document
        .getElementById("notificationToggle")
        .addEventListener("click", () => {
          const notificationBar = document.getElementById("notificationBar");
          notificationBar.classList.toggle("open");
        });

      document
        .getElementById("closeNotifications")
        .addEventListener("click", () => {
          const notificationBar = document.getElementById("notificationBar");
          notificationBar.classList.remove("open");
        });

      document.addEventListener("click", (e) => {
        const notificationBar = document.getElementById("notificationBar");
        const notificationToggle =
          document.getElementById("notificationToggle");

        if (
          !notificationBar.contains(e.target) &&
          !notificationToggle.contains(e.target)
        ) {
          notificationBar.classList.remove("open");
        }
      });

      // Search functionality
      const input = document.getElementById("searchInput");
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          const query = input.value.trim();
          if (query) {
            window.location.href = `/results?search_query=${encodeURIComponent(
              query
            )}`;
          }
        }
      });
    }
  }
);

// Inject CSS
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "../../css/app-layout.css";
document.head.appendChild(link);
