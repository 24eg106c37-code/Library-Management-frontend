const historyUser = LibraryApi.currentUser();
if (!historyUser) location.replace('login.html');
else loadTransactions();
async function loadTransactions() {
  const isAdmin = historyUser.role === 'ADMIN';
  const body = document.querySelector('#transaction-rows');
  const message = document.querySelector('.page-message');
  if (!isAdmin) {
    document.querySelector('#member-heading').classList.add('hidden');
    document.querySelector('#transaction-rows').classList.add('member-transactions');
  }
  try {
    const transactions = await LibraryApi.request(isAdmin ? '/transactions' : `/transactions/member/${historyUser.id}`);
    body.innerHTML = transactions.map(transaction => `<tr><td><strong>${LibraryApi.escape(transaction.bookTitle)}</strong></td>${isAdmin ? `<td>${LibraryApi.escape(transaction.memberName)}</td>` : ''}<td>${LibraryApi.escape(transaction.issueDate)}</td><td>${LibraryApi.escape(transaction.dueDate)}</td><td>${LibraryApi.escape(transaction.returnDate || '—')}</td><td><span class="pill ${transaction.status === 'ISSUED' ? 'issued' : ''}">${LibraryApi.escape(transaction.status)}</span></td><td>${!isAdmin && transaction.status === 'ISSUED' ? `<button class="table-action" data-return="${transaction.id}">Return</button>` : ''}</td></tr>`).join('') || `<tr><td colspan="${isAdmin ? 7 : 6}">No transactions to show.</td></tr>`;
  } catch (error) { message.textContent = error.message; }
}
document.querySelector('#transaction-rows').addEventListener('click', async event => {
  const button = event.target.closest('[data-return]');
  if (!button) return;
  try { await LibraryApi.request(`/transactions/return/${button.dataset.return}`, { method: 'POST' }); loadTransactions(); }
  catch (error) { document.querySelector('.page-message').textContent = error.message; }
});