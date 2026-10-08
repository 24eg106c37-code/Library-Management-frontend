(function () {
  const API_BASE = window.LIBRARY_API_BASE || 'http://localhost:8080/api';
  function currentUser() {
    try { return JSON.parse(sessionStorage.getItem('libraryUser') || 'null'); } catch { return null; }
  }
  async function request(path, options = {}) {
    const user = currentUser();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (user?.token) headers.Authorization = `Bearer ${user.token}`;
    let response;
    try {
      response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } catch {
      throw new Error('Cannot reach the library service. Start Spring Boot and try again.');
    }
    if (response.status === 204) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `Request failed (${response.status}).`);
    return data;
  }
  function escape(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }
  function requireRole(role) {
    const user = currentUser();
    if (!user || (role && user.role !== role)) {
      location.replace('login.html');
      return null;
    }
    return user;
  }
  function signOut() {
    sessionStorage.removeItem('libraryUser');
    location.href = 'index.html';
  }
  document.addEventListener('click', event => { if (event.target.closest('#sign-out')) signOut(); });
  window.LibraryApi = { request, currentUser, requireRole, escape, signOut };
}());