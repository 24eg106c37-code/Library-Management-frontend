const activeUser = LibraryApi.currentUser();
if (activeUser?.role === 'ADMIN') {
  document.querySelector('#app-nav').innerHTML = '<a class="active" href="books.html">Catalog</a><a href="admin-dashboard.html">Overview</a><a href="transactions.html">Transactions</a><button class="nav-user" id="sign-out">Sign out ↗</button>';
  document.querySelector('#add-book-link').classList.remove('hidden');
}
if (activeUser?.role === 'MEMBER') document.querySelector('#app-nav').innerHTML = '<a class="active" href="books.html">Catalog</a><a href="member-dashboard.html">My books</a><a href="transactions.html">History</a><button class="nav-user" id="sign-out">Sign out ↗</button>';
const searchInput = document.querySelector('#book-search');
searchInput.value = new URLSearchParams(location.search).get('q') || '';
let searchTimer;
async function loadBooks() {
  const keyword = searchInput.value.trim();
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
  const body = document.querySelector('#book-rows');
  const message = document.querySelector('#catalog-message');
  message.textContent = '';
  body.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
  try {
    const books = await LibraryApi.request(`/books${query}`);
    document.querySelector('#book-count').textContent = `${books.length} ${books.length === 1 ? 'title' : 'titles'}`;
    body.innerHTML = books.map(book => {
      const actions = activeUser?.role === 'ADMIN'
        ? `<a class="table-action" href="edit-book.html?id=${book.id}">Edit</a><button class="table-action danger" data-delete="${book.id}" data-title="${LibraryApi.escape(book.title)}">Delete</button>`
        : activeUser?.role === 'MEMBER' && book.availableQuantity > 0
          ? `<button class="table-action" data-issue="${book.id}">Issue book</button>`
          : activeUser?.role === 'MEMBER' ? '<span class="muted">Unavailable</span>' : '<a class="table-action" href="login.html">Sign in to borrow</a>';
      return `<tr><td class="book-title-cell"><strong>${LibraryApi.escape(book.title)}</strong><small>${LibraryApi.escape(book.publisher || 'Publisher not listed')} · ${book.publicationYear || 'Year unknown'}</small></td><td>${LibraryApi.escape(book.author)}</td><td>${LibraryApi.escape(book.category)}</td><td>${LibraryApi.escape(book.isbn)}</td><td><span class="pill ${book.availableQuantity ? '' : 'issued'}">${book.availableQuantity} / ${book.quantity} available</span></td><td><div class="table-actions">${actions}</div></td></tr>`;
    }).join('') || '<tr><td colspan="6">No titles match this search.</td></tr>';
  } catch (error) { body.innerHTML = `<tr><td colspan="6" class="error-text">${LibraryApi.escape(error.message)}</td></tr>`; }
}
searchInput.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadBooks, 250); });
document.querySelector('#book-rows').addEventListener('click', async event => {
  const deleteButton = event.target.closest('[data-delete]');
  const issueButton = event.target.closest('[data-issue]');
  try {
    if (deleteButton && confirm(`Delete "${deleteButton.dataset.title}" from the catalog?`)) await LibraryApi.request(`/books/${deleteButton.dataset.delete}`, { method: 'DELETE' });
    if (issueButton) {
      issueButton.disabled = true;
      await LibraryApi.request('/transactions/issue', { method: 'POST', body: JSON.stringify({ bookId: Number(issueButton.dataset.issue) }) });
      message = 'Book issued. You can see the due date in your reading room.';
      document.querySelector('#catalog-message').textContent = message;
    }
    if (deleteButton || issueButton) loadBooks();
  } catch (error) { document.querySelector('#catalog-message').textContent = error.message; }
});
loadBooks();