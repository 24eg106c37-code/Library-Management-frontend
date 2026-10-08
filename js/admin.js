const adminUser = LibraryApi.requireRole('ADMIN');
if (adminUser) loadAdminDashboard();
async function loadAdminDashboard() {
  const message = document.querySelector('.page-message');
  try {
    const [books, members, transactions] = await Promise.all([
      LibraryApi.request('/books'), LibraryApi.request('/members'), LibraryApi.request('/transactions')
    ]);
    document.querySelector('#total-books').textContent = books.reduce((sum, book) => sum + book.quantity, 0);
    document.querySelector('#available-books').textContent = books.reduce((sum, book) => sum + book.availableQuantity, 0);
    document.querySelector('#issued-books').textContent = books.reduce((sum, book) => sum + book.quantity - book.availableQuantity, 0);
    document.querySelector('#total-members').textContent = members.length;
    document.querySelector('#member-rows').innerHTML = members.map(member => `<tr><td><strong>${LibraryApi.escape(member.name)}</strong></td><td>${LibraryApi.escape(member.email)}</td><td>${LibraryApi.escape(member.phone || '—')}</td></tr>`).join('') || '<tr><td colspan="3">No registered members yet.</td></tr>';
    document.querySelector('#recent-transactions').innerHTML = transactions.slice(0, 5).map(transaction => `<div class="activity-item"><div><strong>${LibraryApi.escape(transaction.bookTitle)}</strong><small>${LibraryApi.escape(transaction.memberName)} · ${LibraryApi.escape(transaction.issueDate)}</small></div><span class="pill ${transaction.status === 'ISSUED' ? 'issued' : ''}">${LibraryApi.escape(transaction.status)}</span></div>`).join('') || '<p class="muted">No transactions yet.</p>';
  } catch (error) { message.textContent = error.message; }
}