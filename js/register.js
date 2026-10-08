document.querySelector('#register-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = form.querySelector('.form-message');
  const button = form.querySelector('button[type="submit"]');
  message.textContent = '';
  button.disabled = true;
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const user = await LibraryApi.request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    sessionStorage.setItem('libraryUser', JSON.stringify(user));
    location.href = 'member-dashboard.html';
  } catch (error) { message.textContent = error.message; }
  finally { button.disabled = false; }
});