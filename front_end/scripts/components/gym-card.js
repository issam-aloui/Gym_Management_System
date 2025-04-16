class GymCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // Get attributes or set defaults
    const src = this.getAttribute("src") || "../assets/gym.png";
    const name = this.getAttribute("name") || "Gym Name";
    const place = this.getAttribute("place") || "Location";
    const rate = parseFloat(this.getAttribute("rate")) || 0;
    const totalFeedback = this.getAttribute("total-feedback") || "0";
    const id = this.getAttribute("gym-id") || "";

    // Render the component
    
    this.render(src, name, place, rate, totalFeedback , id);
  }

  // Generate star rating HTML based on the rate value
  generateStarRating(rate) {
    // Round to nearest half star
    const roundedRate = Math.round(rate * 2) / 2;
    let stars = "";

    // Generate full stars
    for (let i = 1; i <= Math.floor(roundedRate); i++) {
      stars += '<span class="star full">★</span>';
    }

    // Add half star if needed
    if (roundedRate % 1 !== 0) {
      stars += '<span class="star half">★</span>';
    }

    // Add empty stars
    const emptyStars = 5 - Math.ceil(roundedRate);
    for (let i = 0; i < emptyStars; i++) {
      stars += '<span class="star empty">★</span>';
    }

    return stars;
  }

  render(src, name, place, rate, totalFeedback, id) {
    const starRating = this.generateStarRating(rate);

    this.shadowRoot.innerHTML = `
      <style>
        /* Card Container */
        .card-container {
          width: 100%;
          height: 380px;
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          font-family: "Nunito Sans", sans-serif;
        }
        
        .card-container:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(232, 93, 4, 0.2);
        }
        
        .card-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #e85d04, #f48c06, #ffba08);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.5s ease;
        }
        
        .card-container:hover::before {
          transform: scaleX(1);
        }
        
        /* Card Image */
        .card-gym-image {
          width: 100%;
          height: 200px;
          background-image: var(--bg-image, url("../assets/gym.png"));
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border-radius: 12px 12px 0 0;
          transition: all 0.5s ease;
          position: relative;
          overflow: hidden;
        }
        
        .card-gym-image::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .card-container:hover .card-gym-image {
          transform: scale(1.05);
        }
        
        .card-container:hover .card-gym-image::after {
          opacity: 1;
        }
        
        /* Card Details */
        .card-gym-details {
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-grow: 1;
        }
        
        .card-gym-details h1 {
          font-size: 18px;
          color: #202224;
          margin: 0;
          transition: color 0.3s ease;
          font-weight: 700;
        }
        
        .card-container:hover .card-gym-details h1 {
          color: #e85d04;
        }
        
        .card-gym-details h2 {
          font-size: 16px;
          color: #e85d04;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 600;
        }
        
        .card-gym-details h2::before {
          content: "📍";
          font-size: 14px;
        }

        /* Rating Section */
        .rating-container {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }
        
        .rating {
          display: flex;
          gap: 2px;
        }
        
        .star {
          font-size: 16px;
          transition: all 0.2s ease;
        }
        
        .star.full {
          color: #ffba08;
        }
        
        .star.half {
          position: relative;
          color: #ffba08;
        }
        
        .star.half::after {
          content: "★";
          position: absolute;
          left: 0;
          top: 0;
          width: 50%;
          overflow: hidden;
          color: #ffba08;
        }
        
        .star.empty {
          color: #e0e0e0;
        }
        
        .total-feedback {
          font-size: 13px;
          color: #666;
        }

        /* CTA Button */
        .cta-button {
          margin-top: auto;
          padding: 10px 16px;
          background: linear-gradient(45deg, #e85d04, #f48c06);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          text-decoration: none;
          display: block;
          position: relative;
          overflow: hidden;
        }
        
        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: all 0.5s ease;
        }
        
        .cta-button:hover::before {
          left: 100%;
        }
        
        .cta-button:hover {
          background: linear-gradient(45deg, #f48c06, #ffba08);
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(232, 93, 4, 0.3);
        }
        
        .cta-button:active {
          transform: translateY(0);
        }
        
        /* Animation */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        :host {
          animation: fadeIn 0.6s ease forwards;
          display: block;
        }
        
        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .card-container {
            height: 360px;
          }
          
          .card-gym-image {
            height: 180px;
          }
        }
        
        @media (max-width: 480px) {
          .card-container {
            height: 340px;
          }
          
          .card-gym-details {
            padding: 15px;
          }
          
          .card-gym-details h1 {
            font-size: 17px;
          }
        }
      </style>
      
      <div class="card-container">
        <div class="card-gym-image" style="--bg-image: url('${src}')">
        </div>
        <div class="card-gym-details">
          <h1>${name}</h1>
          <h2>${place}</h2>
          <div class="rating-container">
            <div class="rating">
              ${starRating}
            </div>
            <span class="total-feedback">(${totalFeedback})</span>
          </div>
          <button class="cta-button" onclick="window.location.href='/gym/${id}/join'">Join Now</button>
        </div>
      </div>
    `;
  }

  // Observe attribute changes to update component
  static get observedAttributes() {
    return ["src", "name", "place", "rate", "total-feedback" , "id"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      const src = this.getAttribute("src") || "../assets/gym.png";
      const gymName = this.getAttribute("name") || "Gym Name";
      const place = this.getAttribute("place") || "Location";
      const rate = parseFloat(this.getAttribute("rate")) || 0;
      const totalFeedback = this.getAttribute("total-feedback") || "0";
      const id = this.getAttribute("gym-id") || "";

      this.render(src, gymName, place, rate, totalFeedback, id);
    }
  }
}

// Register the custom element
customElements.define("gym-card", GymCard);

const script = document.createElement("script");
script.src = "https://kit.fontawesome.com/92a2a0f569.js";
script.crossOrigin = "anonymous";
document.body.appendChild(script);
