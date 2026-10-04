import {
  Travel,
  asyncOperation,
  loadFromStorage,
  saveToStorage,
} from './model.js';

const travels = loadFromStorage ();

function renderList () {
  const listElement = document.getElementById ('entity-list');
  if (!listElement) return;

  listElement.innerHTML = '';

  for (const travel of travels) {
    const card = document.createElement ('div');
    card.className = 'travel-card';
    card.dataset.testid = 'entity-card';

    const title = document.createElement ('h3');
    title.textContent = `${travel.travelerName} (ID: ${travel.id})`;

    const count = document.createElement ('p');
    count.textContent = `Посещено стран: ${travel.visitedCount}`;

    const countries = document.createElement ('p');
    countries.textContent = travel.visitedCountries.length > 0
      ? travel.visitedCountries.join (', ')
      : 'Страны не добавлены';

    const deleteBtn = document.createElement ('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.type = 'button';
    deleteBtn.dataset.testid = 'delete-entity';
    deleteBtn.dataset.id = String (travel.id);
    deleteBtn.textContent = 'Удалить путешествие';

    card.appendChild (title);
    card.appendChild (count);
    card.appendChild (countries);
    card.appendChild (deleteBtn);
    listElement.appendChild (card);
  }
}

function handleAddTravel (event) {
  event.preventDefault ();

  const form = event.target;
  const id = Number (form.elements['id'].value);
  const travelerName = form.elements['travelerName'].value.trim ();
  const country = form.elements['visitedCountries'].value.trim ();

  if (!id || !travelerName) {
    alert ('Заполните ID и имя');
    return;
  }

  const submitBtn = form.querySelector ('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
  }

  asyncOperation (() => {
    const exists = travels.some (item => item.id === id);
    if (exists) {
      throw new Error ('Путешествие с таким ID уже существует');
    }

    const newTravel = new Travel (id, travelerName);
    if (country) {
      newTravel.addCountry (country);
    }

    travels.push (newTravel);
    saveToStorage (travels);
    return newTravel;
  })
    .then (() => {
      form.reset ();
      renderList ();
    })
    .catch (error => {
      alert (error.message);
    })
    .finally (() => {
      if (submitBtn) {
        submitBtn.disabled = false;
      }
    });
}

function handleDeleteTravel (id) {
  const btn = document.querySelector (`button[data-id="${id}"]`);
  if (btn) {
    btn.disabled = true;
  }

  asyncOperation (() => {
    const index = travels.findIndex (item => item.id === id);
    if (index === -1) {
      throw new Error ('Путешествие не найдено');
    }
    travels.splice (index, 1);
    saveToStorage (travels);
  })
    .then (() => {
      renderList ();
    })
    .catch (error => {
      alert (error.message);
      if (btn) {
        btn.disabled = false;
      }
    });
}

document.addEventListener ('DOMContentLoaded', () => {
  renderList ();

  const form = document.getElementById ('travel-form');
  if (form) {
    form.addEventListener ('submit', handleAddTravel);
  }

  const listElement = document.getElementById ('entity-list');
  if (listElement) {
    listElement.addEventListener ('click', event => {
      const target = event.target;
      if (target.dataset.testid === 'delete-entity') {
        const id = Number (target.dataset.id);
        handleDeleteTravel (id);
      }
    });
  }
});
