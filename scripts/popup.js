tinymce.init({
  selector: '#create-copy-textarea',
});

const copies = [];
const createCopyBtn = document.getElementById('create-copy');
const newCopyForm = document.getElementById('create-copy-form');
const deleteAllCopiesBtn = document.getElementById('clear-local');
const paramsForm = document.getElementById('params-form');
const seedCopiesBtn = document.getElementById('seed-copies');
const closeParamsFormBtn = document.getElementById('close-params-form-btn');
const numberOfSeeds = 5;

createCopyBtn.addEventListener('click', () => toggleCreateForm());
newCopyForm.addEventListener('submit', (e) => submitNewCopyForm(e));
deleteAllCopiesBtn.addEventListener('click', () => clearLocalCopies());
seedCopiesBtn.addEventListener('click', () => seedCopies(numberOfSeeds));
closeParamsFormBtn.addEventListener('click', () => {
  document.querySelectorAll('.param-field').forEach((e) => e.remove());
  paramsForm.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', () => {
  const storedCopies = JSON.parse(localStorage.getItem('EXT_COPIES'));
  if (!storedCopies) localStorage.setItem('EXT_COPIES', '[]');
  else if (storedCopies.length === 0) return;
  else {
    for (storedCopy of storedCopies) {
      createCopy({ ...storedCopy, addToLocalStorage: false });
    }
  }
});

function toggleCreateForm() {
  document.getElementById('create-copy-form').classList.toggle('active');

  createCopyBtn.classList.toggle('cancel-action');
  if (createCopyBtn.classList.contains('cancel-action')) {
    createCopyBtn.innerText = 'Cancel';
    createCopyBtn.classList.add('destructive-action-btn');
  } else {
    createCopyBtn.innerText = 'Add Copy';
    createCopyBtn.classList.remove('destructive-action-btn');
  }
}
function submitNewCopyForm(e) {
  e.preventDefault();
  const title = document.getElementById('create-copy-name').value;
  const value = tinymce.get('create-copy-textarea').getContent();
  createCopy({ title, value });
  toggleCreateForm();
}

function createCopy(newCopy) {
  let { id, title, value, addToLocalStorage = true } = newCopy;
  const newDiv = document.createElement('div');
  const copyTitle = document.createElement('h1');
  const copyContents = document.createElement('div');
  console.log(value);
  const params = value.match(/(?<=\[\[).*?(?=\]\])/g) || [];

  if (!id) id = `COPY_${new Date().getTime()}`;
  copyTitle.innerHTML = title;
  copyContents.innerHTML = value;

  newDiv.id = id;
  copyTitle.classList.add('copy-title');
  copyContents.classList.add('copy-value');
  newDiv.classList.add('copy');

  newDiv.appendChild(copyTitle);
  newDiv.appendChild(copyContents);
  newDiv.addEventListener('click', (e) => copyValue(newDiv.id, e));

  document.getElementById('all-copies').append(newDiv);

  if (addToLocalStorage) {
    const existingCopies = JSON.parse(localStorage.getItem('EXT_COPIES'));
    existingCopies.push({ id, title, value, params });
    localStorage.setItem('EXT_COPIES', JSON.stringify(existingCopies));
    document.getElementById('create-copy-name').value = '';
    tinymce.get('create-copy-textarea').setContent('');
  }
}

function copyValue(id) {
  const allCopies = JSON.parse(localStorage.getItem('EXT_COPIES'));
  const thisCopy = allCopies.filter((copy) => copy.id === id)[0];
  if (thisCopy.params.length > 0) enableEditParams(thisCopy);
  else {
    const copy = document.querySelector(`#${id}`);
    const copyContents = document.querySelector(`#${id} div.copy-value`).textContent;
    navigator.clipboard.writeText(copyContents);
    copy.classList.add('copied');
    setTimeout(() => {
      copy.classList.remove('copied');
    }, 500);
  }
}

function enableEditParams(copy) {
  const copyDiv = document.querySelector(`#${copy.id}`);
  const copyContents = document.querySelector(`#${copy.id} div.copy-value`).textContent;

  paramsForm.style.display = 'block';
  for (param of copy.params.reverse()) {
    const newDiv = document.createElement('div');
    const newLabel = document.createElement('label');
    const newInput = document.createElement('input');

    newDiv.classList.add('param-field');
    newLabel.innerText = param;
    newInput.name = param;
    newInput.placeholder = 'Param Value';
    newInput.required = true;

    newDiv.appendChild(newLabel);
    newDiv.appendChild(newInput);

    paramsForm.prepend(newDiv);
  }

  paramsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const allInputs = document.querySelectorAll('.param-field input');
    let alteredcopy = copyContents;
    for (input of allInputs) {
      const regex = new RegExp(`\\[\\[(${input.name})\\]\\]`, 'gi');
      alteredcopy = alteredcopy.replace(regex, input.value);
    }
    navigator.clipboard.writeText(alteredcopy);
    document.querySelectorAll('.param-field').forEach((e) => e.remove());
    paramsForm.style.display = 'none';

    copyDiv.classList.add('copied');
    setTimeout(() => {
      copyDiv.classList.remove('copied');
    }, 500);
  });
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
    const newCopy = {
      title: 'Test',
      value: '<p>This is a [[test]]</p>',
      params: [],
    };
    setTimeout(function () {
      createCopy(newCopy);
      if (--i) myLoop(i);
    }, 100);
  })(numberOfCopies);
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (JSON.parse(urlParams.get('dev'))) {
  document.getElementById('seed-copies').style.display = 'initial';
}
