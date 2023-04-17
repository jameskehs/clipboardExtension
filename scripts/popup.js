const copies = [];
const createCopyBtn = document.getElementById('create-copy');
const createCopyForm = document.getElementById('create-copy-form');
const clearLocalStorageBtn = document.getElementById('clear-local');
const seedCopiesBtn = document.getElementById('seed-copies');

createCopyBtn.addEventListener('click', () => toggleForm());
createCopyForm.addEventListener('submit', (e) => submitForm(e));
clearLocalStorageBtn.addEventListener('click', () => clearLocalCopies());
seedCopiesBtn.addEventListener('click', () => seedCopies(5));

document.addEventListener('DOMContentLoaded', () => {
  const storedCopies = JSON.parse(localStorage.getItem('EXT_COPIES'));
  if (!storedCopies) {
    localStorage.setItem('EXT_COPIES', '[]');
  } else if (storedCopies.length === 0) return;
  else {
    console.log(storedCopies);
    (function myLoop(i) {
      console.log(i);
      setTimeout(function () {
        createCopy(storedCopies[i].title, storedCopies[i].value, false);
        if (i--) myLoop(i);
      }, 100);
    })(storedCopies.length - 1);
  }
});

document.addEventListener('paste', function (e) {
  console.log('The Past is Happens');
  console.log(e.clipboardData.types);
  ['text/plain', 'text/html'].forEach((format) => {
    console.log(`Format: ${format}`);
    console.log(e.clipboardData.getData(format));
  });
});
function toggleForm() {
  document.getElementById('create-copy-form').classList.toggle('active');

  createCopyBtn.classList.toggle('cancel-action');
  if (createCopyBtn.classList.contains('cancel-action')) {
    createCopyBtn.innerText = 'Cancel';
  } else {
    createCopyBtn.innerText = 'Add Copy';
  }
}
function submitForm(e) {
  e.preventDefault();
  const title = document.getElementById('create-copy-name').value;
  const value = tinymce.get('create-copy-textarea').getContent();
  createCopy(title, value);
}
function createCopy(title, value, addToLocalStorage = true) {
  const newDiv = document.createElement('div');
  const copyTitle = document.createElement('h1');
  const copyContents = document.createElement('div');
  const newID = new Date().getTime();

  copyTitle.innerHTML = `${title} - ${newID}`;
  copyContents.innerHTML = value;

  newDiv.id = `COPY_${newID}`;
  copyTitle.classList.add('copy-title');
  copyContents.classList.add('copy-value');
  newDiv.classList.add('copy');

  newDiv.appendChild(copyTitle);
  newDiv.appendChild(copyContents);
  newDiv.addEventListener('click', () => copyValue(newDiv.id));

  const fragment = document.createDocumentFragment();
  fragment.appendChild(newDiv);
  document.getElementById('all-copies').append(fragment);

  if (addToLocalStorage) {
    const existingCopies = JSON.parse(localStorage.getItem('EXT_COPIES'));
    existingCopies.push({ title, value });
    localStorage.setItem('EXT_COPIES', JSON.stringify(existingCopies));
    document.getElementById('create-copy-name').value = '';
    tinymce.get('create-copy-textarea').setContent('');
  }
}
function copyValue(id) {
  const copy = document.querySelector(`#${id} div.copy-value`);
  navigator.clipboard.writeText(copy.textContent);
}
function clearLocalCopies() {
  localStorage.setItem('EXT_COPIES', '[]');
  const allCopies = document.getElementById('all-copies');
  while (allCopies.firstChild) {
    allCopies.removeChild(allCopies.lastChild);
  }
}
function seedCopies(numberOfCopies) {
  (function myLoop(i) {
    setTimeout(function () {
      createCopy(`Test ${i}`, Math.floor(Math.random() * 999999));
      console.log(i);
      if (--i) myLoop(i);
    }, 100);
  })(numberOfCopies);
}
