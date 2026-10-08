const loginForm = document.querySelector('#login-form');
const roleSelect = loginForm.elements.role;
const username = loginForm.elements.username;
function syncLoginLabel() {
  const admin = roleSelect.value === 'ADMIN';
  document.querySelector('#username-label').firstChild.textContent = admin ? 'Username' : 'Email address';
  username.type = admin ? 'text' : 'email';
  username.autocomplete = admin ? 'username' : 'email';
}
roleSelect.addEventListener('change', syncLoginLabel);
syncLoginLabel();
loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  const message = loginForm.querySelector('.form-message');
  message.textContent = '';
  const button = loginForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const user = await LibraryApi.request('/auth/login', { method: 'POST', body: JSON.stringify({ username: username.value.trim(), password: loginForm.elements.password.value, role: roleSelect.value }) });
    sessionStorage.setItem('libraryUser', JSON.stringify(user));
    location.href = user.role === 'ADMIN' ? 'admin-dashboard.html' : 'member-dashboard.html';
  } catch (error) { message.textContent = error.message; }
  finally { button.disabled = false; }
});