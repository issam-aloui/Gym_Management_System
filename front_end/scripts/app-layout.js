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

    }
});

const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "../css/app-layout.css";
document.head.appendChild(link);

/*function setupNavigation() {
  const links = document.querySelectorAll("aside nav ul li a");
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      links.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const section = link.classList[0].replace("nav-", "");
      switch (section) {
        case "home":
          loadSection(section);
          break;
        default:
          loadSection(section);
          break;
      }
    });
  });
}

function loadSection(sectionName) {
  document.getElementById("mainContent").innerHTML = `
        <h2>${
          sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
        } Section</h2>
        <p>This section is under construction.</p>
      `;
}
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
}); */