function getGymIdFromUrl() {
  const parts = window.location.pathname.split('/');
  return parts[2] || null; 
}

document.getElementById('join-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('full-name').value.trim();
  const description = document.getElementById('description').value.trim();
  const password = document.getElementById('gym-password').value.trim();
  const gymId = getGymIdFromUrl();
  const message = document.getElementById('message');

  if (!gymId || !fullName || !password) {
    message.textContent = 'Full name and password are required.';
    message.className = 'error-message';
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/membershipRequest/memreq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ gymId, fullName, description, password })
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
    console.error(err);
    message.textContent = 'Network error.';
    message.className = 'error-message';
  }
});
