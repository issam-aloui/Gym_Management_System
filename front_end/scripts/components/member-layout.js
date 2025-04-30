class MemberCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const name = this.getAttribute("name") || "Member Name";
    const status = this.getAttribute("status") || "pending"; // approved, pending, or rejected
    const src = this.getAttribute("src") || "../../assets/user.png";
    const joinedDate = this.getAttribute("data-joined") || "Unknown";
    const email = this.getAttribute("data-email") || "";
    const phone = this.getAttribute("data-phone") || "";
    const memberId = this.getAttribute("data-id") || "";
    const description = this.getAttribute("data-description") || "";

    this.render(name, status, src, joinedDate, email, phone, memberId, description);
    
    // Add event listeners after rendering
    this.attachEventListeners();
  }

  render(name, status, src, joinedDate, email, phone, memberId, description) {
    // Normalize status to lowercase for consistency
    const normalizedStatus = status.toLowerCase();
    
    // Convert 'rejected' to 'declined' for display consistency if needed
    const displayStatus = normalizedStatus === 'rejected' ? 'declined' : normalizedStatus;
    
    // Map status to display text and color class
    const statusDisplay = {
      'approved': { text: 'Approved', icon: '✓' },
      'pending': { text: 'Pending', icon: '⌛' },
      'declined': { text: 'Declined', icon: '✕' },
      'rejected': { text: 'Declined', icon: '✕' }
    };
    
    // Get the appropriate status display or use default
    const statusInfo = statusDisplay[normalizedStatus] || { text: 'Unknown', icon: '?' };

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          animation: fadeIn 0.4s ease;
        }
        
        .card {
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          height: 100%;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 25px rgba(232, 93, 4, 0.2);
        }
        
        .card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .photo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e85d04;
          flex-shrink: 0;
        }
        
        .header-info {
          flex-grow: 1;
        }
        
        .name {
          font-size: 18px;
          font-weight: 700;
          color: #0e1428;
          margin: 0 0 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .joined {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
        
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
        }
        
        .status-icon {
          font-size: 12px;
        }
        
        .approved {
          background-color: #45c164;
        }
        
        .pending {
          background-color: #fbb934;
        }
        
        .declined, .rejected {
          background-color: #d9534f;
        }
        
        .card-body {
          padding: 15px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-grow: 1;
        }
        
        .description {
          font-size: 14px;
          line-height: 1.5;
          color: #555;
          margin: 0;
          flex-grow: 1;
        }
        
        .contact-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #666;
        }
        
        .contact-info svg {
          flex-shrink: 0;
        }
        
        .card-footer {
          display: flex;
          padding: 15px 20px;
          justify-content: space-between;
          border-top: 1px solid #eee;
        }
        
        .action-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: ${normalizedStatus === 'pending' ? 'block' : 'none'};
        }
        
        .approve-btn {
          background-color: #45c164;
          color: white;
        }
        
        .approve-btn:hover {
          background-color: #3dad57;
        }
        
        .decline-btn {
          background-color: #d9534f;
          color: white;
        }
        
        .decline-btn:hover {
          background-color: #c6403b;
        }
        
        .contact-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #e85d04;
          background-color: transparent;
          color: #e85d04;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .contact-btn:hover {
          background-color: #e85d04;
          color: white;
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
        }
        
        .hidden {
          display: none;
        }
        
        @media (max-width: 500px) {
          .card-header {
            padding: 15px;
          }
          
          .photo {
            width: 50px;
            height: 50px;
          }
          
          .card-body, .card-footer {
            padding: 12px 15px;
          }
        }
      </style>

      <div class="card">
        <div class="card-header">
          <img class="photo" src="${src}" alt="${name}" />
          <div class="header-info">
            <h3 class="name">${name}</h3>
            <p class="joined">Joined: ${joinedDate}</p>
          </div>
          <div class="status-badge ${displayStatus}">
            <span class="status-icon">${statusInfo.icon}</span>
            ${statusInfo.text}
          </div>
        </div>
        
        <div class="card-body">
          ${description ? `
            <p class="description">${description}</p>
          ` : ''}
          
          ${email ? `
            <div class="contact-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              ${email}
            </div>
          ` : ''}
          
          ${phone ? `
            <div class="contact-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              ${phone}
            </div>
          ` : ''}
        </div>
        
        <div class="card-footer">
          <button class="action-btn approve-btn" data-id="${memberId}">Approve</button>
          <button class="action-btn decline-btn" data-id="${memberId}">Decline</button>
          <button class="contact-btn" data-id="${memberId}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            Contact
          </button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const approveBtn = this.shadowRoot.querySelector('.approve-btn');
    const declineBtn = this.shadowRoot.querySelector('.decline-btn');
    const contactBtn = this.shadowRoot.querySelector('.contact-btn');
    
    if (approveBtn) {
      approveBtn.addEventListener('click', () => {
        this.handleStatusChange('approved');
      });
    }
    
    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        this.handleStatusChange('rejected');  // Using 'rejected' to match your schema
      });
    }
    
    if (contactBtn) {
      contactBtn.addEventListener('click', () => {
        this.handleContact();
      });
    }
  }
  
  handleStatusChange(newStatus) {
    const memberId = this.getAttribute('data-id');
    if (!memberId) return;
    
    // Confirm before changing status
    const memberName = this.getAttribute('name');
    const actionText = newStatus === 'approved' ? 'approve' : 'reject';
    const confirmMsg = `Are you sure you want to ${actionText} the membership for ${memberName}?`;
    
    if (confirm(confirmMsg)) {
      // Show loading state
      this.setLoading(true);
      
      // Make API call to update status
      fetch(`/api/memberships/${memberId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update status');
        }
        return response.json();
      })
      .then(data => {
        // Update the card with new status
        this.setAttribute('status', newStatus);
        this.updateCardStatus(newStatus);
        
        // Display success message
        alert(`Membership ${actionText}d successfully!`);
        
        // Trigger event for counters update
        const event = new CustomEvent('memberstatuschange', {
          bubbles: true,
          composed: true,
          detail: { id: memberId, newStatus }
        });
        this.dispatchEvent(event);
      })
      .catch(error => {
        console.error('Error updating status:', error);
        alert('Failed to update status. Please try again.');
      })
      .finally(() => {
        this.setLoading(false);
      });
    }
  }
  
  handleContact() {
    const memberName = this.getAttribute('name');
    const email = this.getAttribute('data-email');
    
    if (email) {
      window.location.href = `mailto:${email}?subject=Regarding your GymFit Membership`;
    } else {
      alert(`No contact information available for ${memberName}`);
    }
  }

  setLoading(isLoading) {
    const buttons = this.shadowRoot.querySelectorAll('button');
    buttons.forEach(button => {
      button.disabled = isLoading;
      if (isLoading) {
        button.dataset.originalText = button.innerHTML;
        if (button.classList.contains('approve-btn') || button.classList.contains('decline-btn')) {
          button.innerHTML = 'Processing...';
        }
      } else if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
      }
    });
  }
  
  updateCardStatus(newStatus) {
    const statusBadge = this.shadowRoot.querySelector('.status-badge');
    const approveBtn = this.shadowRoot.querySelector('.approve-btn');
    const declineBtn = this.shadowRoot.querySelector('.decline-btn');
    
    // Update status badge class and text
    if (statusBadge) {
      // Remove all existing status classes
      statusBadge.classList.remove('approved', 'pending', 'declined', 'rejected');
      
      // Add the new status class (convert 'rejected' to 'declined' for display)
      const displayStatus = newStatus === 'rejected' ? 'declined' : newStatus;
      statusBadge.classList.add(displayStatus);
      
      // Update the status text and icon
      const statusDisplay = {
        'approved': { text: 'Approved', icon: '✓' },
        'pending': { text: 'Pending', icon: '⌛' },
        'declined': { text: 'Declined', icon: '✕' },
        'rejected': { text: 'Declined', icon: '✕' }
      };
      
      const statusInfo = statusDisplay[newStatus] || { text: 'Unknown', icon: '?' };
      statusBadge.innerHTML = `<span class="status-icon">${statusInfo.icon}</span>${statusInfo.text}`;
    }
    
    // Hide the action buttons since status is no longer pending
    if (approveBtn) approveBtn.style.display = 'none';
    if (declineBtn) declineBtn.style.display = 'none';
  }

  static get observedAttributes() {
    return ['name', 'status', 'src', 'data-joined', 'data-email', 'data-phone', 'data-id', 'data-description'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.shadowRoot.querySelector('.card')) {
      const name = this.getAttribute("name") || "Member Name";
      const status = this.getAttribute("status") || "pending";
      const src = this.getAttribute("src") || "../../assets/user.png";
      const joinedDate = this.getAttribute("data-joined") || "Unknown";
      const email = this.getAttribute("data-email") || "";
      const phone = this.getAttribute("data-phone") || "";
      const memberId = this.getAttribute("data-id") || "";
      const description = this.getAttribute("data-description") || "";
      
      this.render(name, status, src, joinedDate, email, phone, memberId, description);
      this.attachEventListeners();
    }
  }
}

customElements.define("member-card", MemberCard);