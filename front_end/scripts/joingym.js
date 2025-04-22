document.addEventListener("DOMContentLoaded", () => {
  function getGymIdFromUrl() {
    const parts = window.location.pathname.split('/');
    return parts[2] || null; 
  }


  

  const form = document.getElementById('join-form');
  const message = document.getElementById('message');

  if (!form) {
    console.error("❌ Form with id 'join-form' not found!");
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('full-name').value.trim();
    const description = document.getElementById('description').value.trim();
    const password = document.getElementById('gym-password').value.trim();
    const gymId = getGymIdFromUrl();
 

    if (!gymId || !fullName || !password) {
      message.textContent = 'Full name and password are required.';
      message.className = 'error-message';
      return;
    }

    try {
      console.log(" Script loaded and DOM is ready.");

      const response = await fetch("http://localhost:5000/joingym/memreq", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type' : 'application/json'
        },  
        body: JSON.stringify({ gymId,fullName, description, password })
    });
      

      const data = await response.json();

      if (response.ok) {
        message.textContent = 'Request sent successfully!';
        message.className = 'success-message';
      } else {
        message.textContent = data.error || 'Something went wrong.';
        message.className = 'error-message';
      }

    } catch (err) {
      message.textContent = 'Network error.';
      message.className = 'error-message';
    }
  });
});
