class MemberCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode:'open'});
  }

  connectedCallback(){
    const name   = this.getAttribute('name');
    const status = this.getAttribute('status');
    const src    = this.getAttribute('src');


    const { userId, gymId, fullName, description, password } = this.dataset; //learned datasetway

    this.shadowRoot.innerHTML = `
      <style>
        .card { 
          border:1px solid #ddd; 
          padding:8px; 
          border-radius:6px; 
          background:#fff; 
          box-shadow:0 2px 5px rgba(0,0,0,0.1);
          transition:transform .2s;
        }
        .card:hover { transform:translateY(-3px); }
        .h { display:flex; align-items:center; gap:8px; }
        img { width:40px; height:40px; border-radius:50%; object-fit:cover; }
        h3 { margin:0; font-size:14px; flex:1; color:#0e1428; }
        .stat { padding:2px 6px; border-radius:4px; color:#fff; text-transform:capitalize; font-size:12px; }
        .approved{background:#45c164;} 
        .pending{background:#fbb934;} 
        .rejected{background:#d9534f;}
        .actions { margin-top:8px; display:flex; gap:6px; }
        button { 
          flex:1; 
          padding:4px; 
          border:none; 
          border-radius:4px; 
          cursor:pointer; 
          font-size:12px;
        }
        .accept { background:#45c164; color:#fff; }
        .decline{ background:#d9534f; color:#fff; }
      </style>
      <div class="card">
        <div class="h">
          <img src="${src}" alt="${name}">
          <h3>${name}</h3>
          <div class="stat ${status}">${status}</div>
        </div>
        ${status==='pending'?`
          <div class="actions">
            <button class="accept">Accept</button>
            <button class="decline">Decline</button>
          </div>`:``}
      </div>
    `;

    if(status==='pending'){
      this.shadowRoot.querySelector('.accept')
        .addEventListener('click', () => this._submit('A',{ userId, gymId, fullName, description, password }));
      this.shadowRoot.querySelector('.decline')
        .addEventListener('click', () => this._submit('D',{ userId, gymId, fullName, description }));
    }
  }

  async _submit(action, body) {
    const url = action==='A' ? '/joingym/memreqA' : '/joingym/memreqD';

    console.log('Submitting', action, body);

    try {
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(body)
      });
      if(!res.ok) throw await res.json();

      // update UI
      const badge = this.shadowRoot.querySelector('.stat');
      const newStatus = action==='A' ? 'approved' : 'rejected';
      badge.textContent = newStatus;
      badge.className = `stat ${newStatus}`;
      this.shadowRoot.querySelector('.actions').remove();
    } catch (err) {
      console.error(err);
      alert(err.error || 'Request failed');
    }
  }
}

customElements.define('member-card', MemberCard);
