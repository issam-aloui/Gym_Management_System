class MemberCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const name = this.getAttribute("name");
    const status = this.getAttribute("status");
    const src = this.getAttribute("src");
    const { userId, gymId, fullName, description, password } = this.dataset; //learned dataset way

    this.shadowRoot.innerHTML = `
      <style>
        .card { 
          background: #ffffff;
          border-radius: 16px;
          padding: 1.75rem;
          box-shadow: 0 8px 32px rgba(14, 20, 40, 0.08);
          border: 1px solid rgba(14, 20, 40, 0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        }
        
        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #e85d04, #ff7b00);
          border-radius: 12px 12px 0 0;
        }
          .card:hover { 
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(232, 93, 4, 0.12);
          border-color: rgba(232, 93, 4, 0.15);
        }
        
        .header { 
          display: flex; 
          align-items: center; 
          gap: 1rem; 
          margin-bottom: 1rem;
        }
        
        .avatar-container {
          position: relative;
        }
        
        .avatar { 
          width: 60px; 
          height: 60px; 
          border-radius: 50%; 
          object-fit: cover;
          border: 3px solid #e85d04;
          box-shadow: 0 4px 15px rgba(232, 93, 4, 0.2);
        }
        
        .status-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .status-indicator.pending { background: #ff7b00; }
        .status-indicator.approved { background: #28a745; }
        .status-indicator.rejected { background: #dc3545; }
        
        .member-info {
          flex: 1;
          min-width: 0;
        }
        
        .member-name { 
          font-size: 1.1rem;
          font-weight: 700;
          font-family: "Poppins", sans-serif;
          color: #0e1428;
          margin: 0 0 0.25rem 0;
          line-height: 1.3;
        }
        
        .member-id {
          font-size: 0.8rem;
          color: #666;
          font-family: "Nunito Sans", sans-serif;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .status-badge { 
          padding: 0.375rem 0.875rem; 
          border-radius: 20px; 
          color: #fff; 
          text-transform: capitalize; 
          font-size: 0.8rem;
          font-weight: 600;
          font-family: "Poppins", sans-serif;
          letter-spacing: 0.025em;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .status-badge i {
          font-size: 0.7rem;
        }
        
        .approved { 
          background: linear-gradient(135deg, #28a745, #20c997);
          box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
        }
        
        .pending { 
          background: linear-gradient(135deg, #e85d04, #ff7b00);
          box-shadow: 0 2px 8px rgba(232, 93, 4, 0.3);
        }
        
        .rejected { 
          background: linear-gradient(135deg, #dc3545, #c82333);
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
        }
          .description {
          margin-top: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
          border-left: 4px solid #e85d04;
          font-size: 0.9rem;
          color: #0e1428;
          line-height: 1.6;
          font-family: "Nunito Sans", sans-serif;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .description strong {
          color: #e85d04;
          font-weight: 600;
        }
        
        .actions { 
          margin-top: 1.5rem; 
          display: flex; 
          gap: 0.75rem; 
        }
          .action-btn { 
          flex: 1; 
          padding: 1rem 1.25rem; 
          border: none; 
          border-radius: 12px; 
          cursor: pointer; 
          font-size: 0.9rem;
          font-weight: 600;
          font-family: "Poppins", sans-serif;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          letter-spacing: 0.025em;
        }
        
        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .accept { 
          background: linear-gradient(135deg, #28a745, #20c997);
          color: #fff;
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.2);
        }
          .accept:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(40, 167, 69, 0.35);
        }
        
        .decline { 
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: #fff;
          box-shadow: 0 4px 15px rgba(220, 53, 69, 0.2);
        }
          .decline:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(220, 53, 69, 0.35);
        }
        
        .loading {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }        .success-message {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #28a745, #20c997);
          color: #fefdf8;
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: "Poppins", sans-serif;
          z-index: 10;
          box-shadow: 0 8px 25px rgba(40, 167, 69, 0.25);
        }

        .error-message {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: #f8d7da;
          color: #721c24;
          border-radius: 8px;
          font-size: 0.85rem;
          border-left: 3px solid #dc3545;
          font-family: "Nunito Sans", sans-serif;
        }
      </style>
      <div class="card fade-in">
        <div class="header">
          <div class="avatar-container">
            <img class="avatar" src="../../assets/icons/pfp.png" alt="${name}" loading="lazy">
            <div class="status-indicator ${status}"></div>
          </div>
          <div class="member-info">
            <h3 class="member-name">${name}</h3>
            <div class="member-id">ID: ${userId.slice(-6).toUpperCase()}</div>
            <div class="status-badge ${status}">
              ${
                status === "approved"
                  ? '<i class="fas fa-check"></i>'
                  : status === "pending"
                  ? '<i class="fas fa-clock"></i>'
                  : '<i class="fas fa-times"></i>'
              }
              ${status}
            </div>
          </div>
        </div>
        
        ${
          description
            ? `<div class="description">
          <strong>Member Message:</strong> ${description}
        </div>`
            : ""
        }
        
        ${
          status === "pending"
            ? `
          <div class="actions">
            <button class="action-btn accept" id="acceptBtn">
              <i class="fas fa-check"></i>
              Accept
            </button>
            <button class="action-btn decline" id="declineBtn">
              <i class="fas fa-times"></i>
              Decline
            </button>
          </div>`
            : ``
        }
      </div>
    `;
    if (status === "pending") {
      const acceptBtn = this.shadowRoot.querySelector("#acceptBtn");
      const declineBtn = this.shadowRoot.querySelector("#declineBtn");

      acceptBtn.addEventListener("click", () =>
        this._submit(
          "A",
          { userId, gymId, fullName, description, password },
          acceptBtn
        )
      );
      declineBtn.addEventListener("click", () =>
        this._submit("D", { userId, gymId, fullName, description }, declineBtn)
      );
    }
  }
  async _submit(action, body, buttonElement) {
    const url = action === "A" ? "/joingym/memreqA" : "/joingym/memreqD";
    const originalText = buttonElement.innerHTML;

    console.log("Submitting", action, body);

    // Show loading state
    buttonElement.disabled = true;
    buttonElement.innerHTML = '<div class="loading"></div>';

    // Disable both buttons during request
    const acceptBtn = this.shadowRoot.querySelector("#acceptBtn");
    const declineBtn = this.shadowRoot.querySelector("#declineBtn");
    if (acceptBtn) acceptBtn.disabled = true;
    if (declineBtn) declineBtn.disabled = true;

    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw await res.json();

      // Update UI with smooth transition
      const badge = this.shadowRoot.querySelector(".status-badge");
      const statusIndicator =
        this.shadowRoot.querySelector(".status-indicator");
      const actionsDiv = this.shadowRoot.querySelector(".actions");

      const newStatus = action === "A" ? "approved" : "rejected";

      // Animate status change
      badge.style.transition = "all 0.3s ease";
      statusIndicator.style.transition = "all 0.3s ease";

      badge.innerHTML = `
        ${
          newStatus === "approved"
            ? '<i class="fas fa-check"></i>'
            : '<i class="fas fa-times"></i>'
        }
        ${newStatus}
      `;
      badge.className = `status-badge ${newStatus}`;
      statusIndicator.className = `status-indicator ${newStatus}`;

      // Remove actions with fade out
      if (actionsDiv) {
        actionsDiv.style.transition = "all 0.3s ease";
        actionsDiv.style.opacity = "0";
        actionsDiv.style.transform = "translateY(-10px)";
        setTimeout(() => actionsDiv.remove(), 300);
      }

      // Update the card's data attribute for filtering
      this.setAttribute("data-status", newStatus);

      // Show success message briefly
      const card = this.shadowRoot.querySelector(".card");
      const successMessage = document.createElement("div");
      successMessage.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${newStatus === "approved" ? "#48bb78" : "#f56565"};
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
        z-index: 10;
        animation: fadeIn 0.3s ease;
      `;
      successMessage.textContent =
        newStatus === "approved" ? "Member Approved!" : "Request Declined";

      card.style.position = "relative";
      card.appendChild(successMessage);

      setTimeout(() => {
        successMessage.style.animation = "fadeOut 0.3s ease";
        setTimeout(() => successMessage.remove(), 300);
      }, 2000);
    } catch (err) {
      console.error(err);

      // Reset button state on error
      buttonElement.disabled = false;
      buttonElement.innerHTML = originalText;

      // Re-enable buttons
      if (acceptBtn) acceptBtn.disabled = false;
      if (declineBtn) declineBtn.disabled = false;

      // Show error message
      const errorMessage = document.createElement("div");
      errorMessage.style.cssText = `
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: #fed7d7;
        color: #c53030;
        border-radius: 6px;
        font-size: 0.85rem;
        border-left: 3px solid #f56565;
      `;
      errorMessage.textContent =
        err.error || "Request failed. Please try again.";

      const card = this.shadowRoot.querySelector(".card");
      card.appendChild(errorMessage);

      setTimeout(() => {
        errorMessage.style.transition = "all 0.3s ease";
        errorMessage.style.opacity = "0";
        setTimeout(() => errorMessage.remove(), 300);
      }, 3000);
    }
  }
}

customElements.define("member-card", MemberCard);
