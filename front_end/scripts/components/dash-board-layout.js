customElements.define(
  "app-layout",
  class extends HTMLElement {
    connectedCallback() {
      const role = this.getAttribute("role");

      this.innerHTML = `
        <header>
          <div class="menu-icon" id="menuToggle">
            <img src="../../assets/icons/menu.png" alt="menu-icon">
          </div>
          <div class="search-container">
            <img src="../../assets/icons/search.png" alt="search" class="search-icon">
            <input type="search" placeholder="Search" class="search-bar">
          </div>
          <div class="user-info">
            <div class="notification-icon">
              <img src="../../assets/icons/noti.svg" alt="notifications">
            </div>
            <div class="user-pfp">
              <img src="../../assets/icons/pfp.png" alt="user pfp">
            </div>
            <div class="user-details">
              <h3 class="user-name">username</h3>
              <p class="user-type">${
                role === "owner" ? "Gym Owner" : "Gym User"
              }</p>
            </div>
          </div>
        </header>

        <aside class="sidebar" id="sidebar">
          <div class="sidebar-container">
            <nav>
              <ul>
                <li><a href="home-user" class="nav-home active">
                  <img src="../../assets/icons/dashboard.svg" alt="Home" />
                  <span>General</span>
                </a></li>
                <li><a href="memerships" class="nav-workout">
                  <img src="../../assets/icons/Membership.svg" alt="Workout" />
                  <span>My MemberShip</span>
                </a></li>
                <li><a href="#" class="nav-profile">
                  <img src="../../assets/icons/classes.svg" alt="Profile" />
                  <span>My Classes</span>
                </a></li>
                <li><a href="#" class="nav-progress">
                  <img src="../../assets/icons/shart.svg" alt="Progress" />
                  <span>Be an Owner</span>
                </a></li>
              </ul>
            </nav>

            <div class="Settings">
              <nav>
                <ul>
                  <li>
                    <a href="settings.html" class="nav-settings">
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

      // Sidebar toggle
      document.getElementById("menuToggle").addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("expanded");
        const main = document.getElementById("mainContent");
        if (main) main.classList.toggle("shifted");
      });
    }
  }
);

// Inject layout CSS
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "../../css/app-layout.css";
document.head.appendChild(link);
