class AnalyticsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Create styles
    const style = document.createElement("style");
    style.textContent = `
      .analytics-card-container {
        max-width: 300px;
        background-color: white;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        transform: translateY(0);
      }
      
      .analytics-card-container:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }
      
      /* Subtle glow effect on hover */
      .analytics-card-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 16px;
        background: radial-gradient(circle at top right, rgba(255,255,255,0.8), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .analytics-card-container:hover::before {
        opacity: 1;
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
        position: relative;
        z-index: 1;
      }
      
      .title_data {
        flex-grow: 1;
      }
      
      .title_data p {
        color: #6c757d;
        font-size: 16px;
        margin-bottom: 4px;
        position: relative;
      }
      
      .title_data h1 {
        font-size: 32px;
        font-weight: 600;
        color: #212529;
        position: relative;
        transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      /* Number counter animation */
      @keyframes countUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .analytics-card-container:hover .title_data h1 {
        transform: scale(1.05);
      }
      
      .icon-container {
        width: 48px;
        height: 48px;
        background-color: #fff3e0;
        border-radius: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .analytics-card-container:hover .icon-container {
        transform: rotate(8deg) scale(1.1);
      }
      
      /* Ripple effect for icon container on mouse enter */
      @keyframes ripple {
        0% { transform: scale(0); opacity: 0.8; }
        100% { transform: scale(2.5); opacity: 0; }
      }
      
      .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.7);
        width: 20px;
        height: 20px;
        animation: ripple 0.8s ease-out;
        pointer-events: none;
      }
      
      .trend-indicator {
        display: flex;
        align-items: center;
        background-color: #e8f5f0;
        border-radius: 6px;
        padding: 8px 12px;
        width: fit-content;
        margin-top: 10px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        z-index: 1;
      }
      
      .analytics-card-container:hover .trend-indicator {
        transform: translateX(5px);
      }
      
      .trend-indicator .arrow {
        margin-right: 4px;
        color: #00c07f;
        font-weight: bold;
        transition: transform 0.3s ease;
      }
      
      .analytics-card-container:hover .trend-indicator .arrow {
        transform: translateY(-2px) scale(1.2);
      }
      
      .analytics-card-container:hover .trend-indicator.down .arrow {
        transform: translateY(2px) scale(1.2);
      }
      
      .trend-indicator .percentage {
        color: #00c07f;
        font-weight: 600;
        margin-right: 4px;
        transition: all 0.3s ease;
      }
      
      .analytics-card-container:hover .trend-indicator .percentage {
        letter-spacing: 0.5px;
      }
      
      .trend-indicator .text {
        color: #6c757d;
        font-size: 14px;
      }
      
      .trend-indicator.down {
        background-color: #ffebee;
      }
      
      .trend-indicator.down .arrow,
      .trend-indicator.down .percentage {
        color: #f44336;
      }
      
      /* Pulse animation for initial load */
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      /* Fade in animation for card */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* Animate data element when it changes */
      @keyframes dataUpdate {
        0% { opacity: 0; transform: translateY(-10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      .data-updated {
        animation: dataUpdate 0.5s ease forwards;
      }
      
      /* Shadow animation on hover */
      @keyframes shadowPulse {
        0% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        50% { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); }
        100% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
      }
      
      .analytics-card-container.pulse {
        animation: pulse 1s ease, shadowPulse 2s infinite;
      }
    `;

    // Create HTML structure
    const container = document.createElement("div");
    container.className = "analytics-card-container";

    container.innerHTML = `
      <div class="card-header">
        <div class="title_data">
          <p></p>
          <h1></h1>
        </div>
        <div class="icon-container">
          <!-- Icon will be inserted here -->
        </div>
      </div>
      <div class="trend-indicator">
        <span class="arrow">↑</span>
        <span class="percentage">8.5%</span>
        <span class="text">Up from last month</span>
      </div>
    `;

    // Append elements to the shadow DOM
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);

    // Store references to elements we'll need to update
    this.container = this.shadowRoot.querySelector(".analytics-card-container");
    this.titleElement = this.shadowRoot.querySelector(".title_data p");
    this.dataElement = this.shadowRoot.querySelector(".title_data h1");
    this.iconContainer = this.shadowRoot.querySelector(".icon-container");
    this.trendIndicator = this.shadowRoot.querySelector(".trend-indicator");
    this.trendArrow = this.shadowRoot.querySelector(".trend-indicator .arrow");
    this.trendPercentage = this.shadowRoot.querySelector(".trend-indicator .percentage");
    this.trendText = this.shadowRoot.querySelector(".trend-indicator .text");

    // Add event listeners for effects
    this.setupEventListeners();

    // Initial icon
    this.updateIcon();
    
    // Add initial animations
    this.container.style.opacity = "0";
  }

  // Called when the element is added to the DOM
  connectedCallback() {
    this.render();
    
    // Add entrance animation with a slight delay based on DOM position
    const delay = this.getPositionInParent() * 150;
    setTimeout(() => {
      this.container.style.animation = `fadeIn 0.6s ease forwards ${delay}ms`;
      this.container.style.opacity = "1";
    }, 100);
    
    // Add pulse animation after a while
    setTimeout(() => {
      this.container.classList.add("pulse");
      
      // Remove pulse after animation completes
      setTimeout(() => {
        this.container.classList.remove("pulse");
      }, 2000);
    }, 1000 + delay);
  }

  // Get the position of this element among siblings to stagger animations
  getPositionInParent() {
    if (!this.parentNode) return 0;
    
    const siblings = Array.from(this.parentNode.children);
    return siblings.indexOf(this);
  }

  // Setup event listeners for interactive effects
  setupEventListeners() {
    // Add ripple effect to icon container
    this.iconContainer.addEventListener("mouseenter", (e) => {
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      this.iconContainer.appendChild(ripple);
      
      // Remove ripple after animation completes
      setTimeout(() => {
        ripple.remove();
      }, 800);
    });
    
    // Add hover effects
    this.container.addEventListener("mousemove", (e) => {
      // Subtle tilt effect based on mouse position
      const rect = this.container.getBoundingClientRect();
      const x = e.clientX - rect.left; 
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const tiltX = (x - centerX) / centerX * 3;
      const tiltY = (y - centerY) / centerY * 3;
      
      this.container.style.transform = `perspective(1000px) rotateX(${-tiltY}deg) rotateY(${tiltX}deg) translateY(-5px)`;
    });
    
    // Reset transform on mouse leave
    this.container.addEventListener("mouseleave", () => {
      this.container.style.transform = "translateY(0)";
    });
  }

  // List of attributes to observe for changes
  static get observedAttributes() {
    return [
      "title",
      "data",
      "icon",
      "icon-color",
      "icon-bg",
      "trend-percentage",
      "trend-direction",
      "trend-period",
    ];
  }

  // Called when an observed attribute changes
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === "icon" || name === "icon-color") {
        this.updateIcon();
      }
      if (name === "icon-bg") {
        this.updateIconBackground();
      }
      if (name === "data" && oldValue !== null) {
        // Animate data change
        this.animateDataChange(oldValue, newValue);
      } else {
        this.render();
      }
    }
  }

  // Animate data changes
  animateDataChange(oldValue, newValue) {
    // Add animation class
    this.dataElement.classList.add("data-updated");
    
    // Update the value
    this.dataElement.textContent = newValue;
    
    // Remove animation class after animation completes
    setTimeout(() => {
      this.dataElement.classList.remove("data-updated");
    }, 500);
    
    // Add pulse effect to the card
    this.container.classList.add("pulse");
    
    // Remove pulse after animation completes
    setTimeout(() => {
      this.container.classList.remove("pulse");
    }, 2000);
  }

  // Update the icon based on the icon attribute
  updateIcon() {
    const iconType = this.getAttribute("icon") || "users";
    const iconColor = this.getAttribute("icon-color") || "#FF9A62";

    // Define SVG icons
    const icons = {
      users: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 7C16 9.2 14.2 11 12 11C9.8 11 8 9.2 8 7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7Z" fill="${iconColor}"/>
          <path d="M12 14C8.7 14 6 16.7 6 20V21H18V20C18 16.7 15.3 14 12 14Z" fill="${iconColor}"/>
        </svg>
      `,
      revenue: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="${iconColor}"/>
          <path d="M12.5 7H10V13H14V11H12.5V7Z" fill="${iconColor}"/>
        </svg>
      `,
      visits: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 6V4H10V6H14ZM4 8V18H20V8H4ZM20 6C21.1 6 22 6.9 22 8V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V8C2 6.9 2.9 6 4 6H8V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6H20Z" fill="${iconColor}"/>
        </svg>
      `,
      activity: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.49 5.48C14.59 5.48 15.49 4.58 15.49 3.48C15.49 2.38 14.59 1.48 13.49 1.48C12.39 1.48 11.49 2.38 11.49 3.48C11.49 4.58 12.39 5.48 13.49 5.48Z" fill="${iconColor}"/>
          <path d="M15.76 7.9L13.49 7.48L12.49 9.48L7.49 14.48L5.49 12.48V17.48L7.49 15.48L12.49 10.48L13.49 8.48L15.76 7.9Z" fill="${iconColor}"/>
          <path d="M19.49 7.48H14.49V9.48H19.49V7.48Z" fill="${iconColor}"/>
          <path d="M19.49 11.48H16.49V13.48H19.49V11.48Z" fill="${iconColor}"/>
          <path d="M19.49 15.48H16.49V17.48H19.49V15.48Z" fill="${iconColor}"/>
        </svg>
      `,
      clock: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="${iconColor}"/>
          <path d="M12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="${iconColor}"/>
        </svg>
      `,
      chart: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 9.2H8V19H5V9.2ZM10.6 5H13.4V19H10.6V5ZM16.2 13H19V19H16.2V13Z" fill="${iconColor}"/>
        </svg>
      `,
      calendar: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V9H19V19ZM19 7H5V5H19V7Z" fill="${iconColor}"/>
          <path d="M12 10.5H17V15.5H12V10.5Z" fill="${iconColor}"/>
        </svg>
      `,
    };

    // Check if the icon exists, if not use a default
    const iconSvg = icons[iconType] || icons.users;

    // Update the icon container with animation
    const oldIcon = this.iconContainer.innerHTML;
    
    // Fade out
    this.iconContainer.style.opacity = "0";
    this.iconContainer.style.transform = "scale(0.8)";
    
    // Update content and fade in
    setTimeout(() => {
      this.iconContainer.innerHTML = iconSvg;
      this.iconContainer.style.opacity = "1";
      this.iconContainer.style.transform = "scale(1)";
    }, 200);
  }

  // Update the icon background color
  updateIconBackground() {
    const bgColor = this.getAttribute("icon-bg") || "#fff3e0";
    
    // Animated background color transition is handled by CSS transitions
    this.iconContainer.style.backgroundColor = bgColor;
  }

  // Update the component based on attributes
  render() {
    const title = this.getAttribute("title") || "Total Members";
    const data = this.getAttribute("data") || "0000";
    const trendPercentage = this.getAttribute("trend-percentage") || "0.0";
    const trendDirection = this.getAttribute("trend-direction") || "up";
    const trendPeriod = this.getAttribute("trend-period") || "last month";

    // Update the icon background if specified
    this.updateIconBackground();

    // Update the elements
    this.titleElement.textContent = title;
    this.dataElement.textContent = data;

    // Set trend direction
    if (trendDirection === "down") {
      this.trendIndicator.classList.add("down");
      this.trendArrow.textContent = "↓";
    } else {
      this.trendIndicator.classList.remove("down");
      this.trendArrow.textContent = "↑";
    }

    this.trendPercentage.textContent = `${trendPercentage}%`;
    this.trendText.textContent =
      trendDirection === "up"
        ? `Up from ${trendPeriod}`
        : `Down from ${trendPeriod}`;
  }
}

// Register the custom element
customElements.define("analytics-card", AnalyticsCard);


/* 
    Usage Example:
    <analytics-card
        title="Total Members"
        data="2,689"
        icon="users"
        icon-color="#FF9A62"
        icon-bg="#fff3e0"
        trend-percentage="8.5"
        trend-direction="up"
        trend-period="last month"
    ></analytics-card>
    */
