const adminForForm = LibraryApi.requireRole('ADMIN');
const bookForm = document.querySelector('#book-form');
const bookId = new URLSearchParams(location.search).get('id');
const formMessage = bookForm.querySelector('.form-message');
if (adminForForm && bookId) {
  LibraryApi.request(`/books/${bookId}`).then(book => {
    for (const field of ['title', 'author', 'category', 'isbn', 'publisher', 'publicationYear', 'quantity']) bookForm.elements[field].value = book[field] ?? '';
    document.querySelector('#availability-hint').textContent = `${book.quantity - book.availableQuantity} copies are currently issued.`;
  }).catch(error => { formMessage.textContent = error.message; });
}
bookForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!adminForForm) return;
  const button = bookForm.querySelector('button[type="submit"]');
  const payload = Object.fromEntries(new FormData(bookForm).entries());
  payload.publicationYear = payload.publicationYear ? Number(payload.publicationYear) : null;
  payload.quantity = Number(payload.quantity);
  button.disabled = true;
  formMessage.textContent = '';
  try {
    await LibraryApi.request(bookId ? `/books/${bookId}` : '/books', { method: bookId ? 'PUT' : 'POST', body: JSON.stringify(payload) });
    location.href = 'books.html';
  } catch (error) { formMessage.textContent = error.message; }
  finally { button.disabled = false; }
});