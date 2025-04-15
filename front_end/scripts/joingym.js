function getGymIdFromUrl() {
  const parts = window.location.pathname.split('/');
  const idPart = parts.find(p => p.startsWith('id:'));
  return idPart ? idPart.split(':')[1] : null;
}

document.getElementById('join-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('full-name').value.trim();
  const description = document.getElementById('description').value.trim();
  const gymId = getGymIdFromUrl();
  const message = document.getElementById('message');

  if (!gymId || !fullName) {
    message.textContent = 'Full name is required.';
    message.style.color = 'red';
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/membershipRequest/memreq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', 
      body: JSON.stringify({ gymId, fullName, description })
    });

    const data = await response.json();

    if (response.ok) {
      message.textContent = 'Request sent successfully!';
      message.style.color = 'green';
    } else {
      message.textContent = data.error || 'Something went wrong.';
      message.style.color = 'red';
    }

  } catch (err) {
    console.error(err);
    message.textContent = 'Network error.';
    message.style.color = 'red';
  }
});
