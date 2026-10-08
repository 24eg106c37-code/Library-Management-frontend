const memberUser = LibraryApi.requireRole('MEMBER');
if (memberUser) loadMemberDashboard();
async function loadMemberDashboard() {
  const message = document.querySelector('.page-message');
  document.querySelector('#member-greeting').textContent = `Welcome back, ${memberUser.name.split(' ')[0]}.`;
  try {
    const [transactions, books] = await Promise.all([
      LibraryApi.request(`/transactions/member/${memberUser.id}`), LibraryApi.request('/books')
    ]);
    const issued = transactions.filter(transaction => transaction.status === 'ISSUED');
    const returned = transactions.filter(transaction => transaction.status === 'RETURNED');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dueSoon = issued.filter(transaction => (new Date(`${transaction.dueDate}T00:00:00`) - today) / 86400000 <= 3);
    document.querySelector('#my-issued-count').textContent = issued.length;
    document.querySelector('#my-due-count').textContent = dueSoon.length;
    document.querySelector('#my-returned-count').textContent = returned.length;
    document.querySelector('#my-book-rows').innerHTML = issued.map(transaction => `<tr><td><strong>${LibraryApi.escape(transaction.bookTitle)}</strong></td><td>${LibraryApi.escape(transaction.issueDate)}</td><td>${LibraryApi.escape(transaction.dueDate)}</td><td><button class="table-action" data-return="${transaction.id}">Return book</button></td></tr>`).join('') || '<tr><td colspan="4">No books on loan. Browse the catalog for your next read.</td></tr>';
    document.querySelector('#member-available').innerHTML = books.filter(book => book.availableQuantity > 0).slice(0, 3).map(book => `<article class="compact-book"><strong>${LibraryApi.escape(book.title)}</strong><span>${LibraryApi.escape(book.author)} · ${book.availableQuantity} available</span></article>`).join('') || '<p class="muted">No available books right now.</p>';
    document.querySelector('#my-book-rows').addEventListener('click', returnHandler);
  } catch (error) { message.textContent = error.message; }
}
async function returnHandler(event) {
  const button = event.target.closest('[data-return]');
  if (!button) return;
  try { await LibraryApi.request(`/transactions/return/${button.dataset.return}`, { method: 'POST' }); loadMemberDashboard(); }
  catch (error) { document.querySelector('.page-message').textContent = error.message; }
}