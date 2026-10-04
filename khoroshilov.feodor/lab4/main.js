let travels = [];

function refresh () {
  renderAll ();
  saveToStorage (travels);
}
function escapeHtml (str) {
  const div = document.createElement ('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr (str) {
  return str
    .replace (/\\/g, '\\\\')
    .replace (/'/g, "\\'")
    .replace (/"/g, '&quot;');
}

function showToast (message, type = 'info') {
  const container = document.getElementById ('toast-container');
  const toast = document.createElement ('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild (toast);
  setTimeout (() => toast.remove (), 3000);
}

function renderAll () {
  renderCards ();
  renderSelect ();
  renderAnalytics ();
}
function renderCards () {
  const box = document.getElementById ('cards-container');

  if (travels.length === 0) {
    box.innerHTML = `
      <div class="empty-state">
        <div class="icon">🧳</div>
        <p>Пока нет путешествий. Создайте первое!</p>
      </div>`;
    return;
  }

  box.innerHTML = travels
    .map (
      t => `
    <div class="travel-card" data-id="${t.id}">
      <button class="delete-travel-btn"
              data-action="delete-travel"
              data-id="${t.id}"
              title="Удалить путешествие">✕</button>

      <div class="card-header">
        <span class="traveler-name">${escapeHtml (t.travelerName)}</span>
        <span class="travel-id">ID: ${t.id}</span>
      </div>

      <div class="visited-count">🌍 Посещено стран: ${t.visitedCount}</div>

      <div class="countries-list">
        ${t.visitedCountries.length === 0 ? '<span style="color:#6b7280;font-size:.85rem">Страны пока не добавлены</span>' : t.visitedCountries
              .map (c => `
              <span class="country-tag">
                ${escapeHtml (c)}
                <button class="remove-country-btn"
                        data-action="remove-country"
                        data-id="${t.id}"
                        data-country="${escapeAttr (c)}"
                        title="Удалить">×</button>
              </span>`)
              .join ('')}
      </div>

      <div class="inline-add">
        <input type="text"
               placeholder="Новая страна"
               data-inline-input="${t.id}">
        <button class="btn btn-success"
                data-action="add-country-inline"
                data-id="${t.id}">+ Страна</button>
      </div>
    </div>`
    )
    .join ('');
}

function renderSelect () {
  const sel = document.getElementById ('select-travel-for-country');
  const cur = sel.value;
  sel.innerHTML =
    '<option value="">— выберите —</option>' +
    travels
      .map (
        t =>
          `<option value="${t.id}" ${t.id == cur ? 'selected' : ''}>` +
          `${escapeHtml (t.travelerName)} (ID: ${t.id})</option>`
      )
      .join ('');
}

function renderAnalytics () {
  // 1) Группировка по кол-ву стран
  const byCount = groupByVisitedCount (travels);
  document.getElementById (
    'analytics-group-by-count'
  ).textContent = Object.keys (byCount).length === 0
    ? 'Нет данных'
    : Object.entries (byCount)
        .sort (([a], [b]) => a - b)
        .map (
          ([n, arr]) =>
            `${n} стран(а): ${arr.map (t => t.travelerName).join (', ')}`
        )
        .join ('\n');

  const unique = getAllUniqueCountries (travels);
  document.getElementById (
    'analytics-unique-countries'
  ).textContent = unique.length ? unique.join (', ') : 'Нет данных';

  const byCountry = groupTravelersByCountry (travels);
  document.getElementById (
    'analytics-group-by-country'
  ).textContent = Object.keys (byCountry).length === 0
    ? 'Нет данных'
    : Object.entries (byCountry)
        .sort (([a], [b]) => a.localeCompare (b))
        .map (
          ([c, arr]) => `${c}: ${arr.map (t => t.travelerName).join (', ')}`
        )
        .join ('\n');
}

function renderFilterByCountry (country) {
  const res = filterByCountry (travels, country);
  document.getElementById (
    'analytics-filter-by-country'
  ).textContent = res.length
    ? res.map (t => `${t.travelerName} (ID: ${t.id})`).join ('\n')
    : `Никто не посещал «${country}»`;
}

function renderMoreThanN (n) {
  const res = getMoreThanN (travels, n);
  document.getElementById ('analytics-more-than-n').textContent = res.length
    ? res.map (t => `${t.travelerName} — ${t.visitedCount} стран`).join ('\n')
    : `Нет путешественников с > ${n} стран`;
}

function handleAddTravel () {
  const idInput = document.getElementById ('input-id');
  const nameInput = document.getElementById ('input-name');
  const id = parseInt (idInput.value, 10);
  const name = nameInput.value.trim ();

  if (!id || isNaN (id))
    return showToast ('Введите корректный ID (число)', 'error');
  if (!name) return showToast ('Введите имя путешественника', 'error');
  if (travels.some (t => t.id === id))
    return showToast (`ID ${id} уже занят`, 'error');

  const btn = document.getElementById ('btn-add-travel');
  btn.disabled = true;

  asyncOperation (() => {
    const t = new Travel (id, name);
    travels.push (t);
    return t;
  })
    .then (t => {
      showToast (`«${t.travelerName}» добавлен`, 'success');
      idInput.value = '';
      nameInput.value = '';
      refresh ();
    })
    .catch (e => showToast (e.message, 'error'))
    .finally (() => (btn.disabled = false));
}

function handleAddCountryFromForm () {
  const sel = document.getElementById ('select-travel-for-country');
  const inp = document.getElementById ('input-country');
  const id = parseInt (sel.value, 10);
  const country = inp.value.trim ();

  if (!id) return showToast ('Выберите путешественника', 'error');
  if (!country) return showToast ('Введите название страны', 'error');

  const btn = document.getElementById ('btn-add-country');
  btn.disabled = true;

  asyncOperation (() => {
    const t = travels.find (t => t.id === id);
    if (!t) throw new Error ('Путешествие не найдено');
    t.addCountry (country);
    return t;
  })
    .then (t => {
      showToast (`«${country}» → ${t.travelerName}`, 'success');
      inp.value = '';
      refresh ();
    })
    .catch (e => showToast (e.message, 'error'))
    .finally (() => (btn.disabled = false));
}

function handleDeleteTravel (id) {
  asyncOperation (() => {
    const idx = travels.findIndex (t => t.id === id);
    if (idx === -1) throw new Error ('Не найдено');
    return travels.splice (idx, 1)[0];
  })
    .then (t => {
      showToast (`«${t.travelerName}» удалён`, 'info');
      refresh ();
    })
    .catch (e => showToast (e.message, 'error'));
}

function handleAddCountryInline (id) {
  const input = document.querySelector (`[data-inline-input="${id}"]`);
  const country = input.value.trim ();
  if (!country) return showToast ('Введите название страны', 'error');

  asyncOperation (() => {
    const t = travels.find (t => t.id === id);
    if (!t) throw new Error ('Не найдено');
    t.addCountry (country);
    return t;
  })
    .then (t => {
      showToast (`«${country}» → ${t.travelerName}`, 'success');
      refresh ();
    })
    .catch (e => showToast (e.message, 'error'));
}

function handleRemoveCountry (id, country) {
  asyncOperation (() => {
    const t = travels.find (t => t.id === id);
    if (!t) throw new Error ('Не найдено');
    t.removeCountry (country);
    return t;
  })
    .then (t => {
      showToast (`«${country}» удалена у ${t.travelerName}`, 'info');
      refresh ();
    })
    .catch (e => showToast (e.message, 'error'));
}

function bindEvents () {
  // Кнопки форм
  document
    .getElementById ('btn-add-travel')
    .addEventListener ('click', handleAddTravel);
  document
    .getElementById ('btn-add-country')
    .addEventListener ('click', handleAddCountryFromForm);

  document
    .getElementById ('btn-filter-country')
    .addEventListener ('click', () => {
      const c = document.getElementById ('filter-country-input').value.trim ();
      if (!c) return showToast ('Введите страну', 'error');
      renderFilterByCountry (c);
    });

  document.getElementById ('btn-filter-n').addEventListener ('click', () => {
    const n = parseInt (document.getElementById ('filter-n-input').value, 10);
    if (isNaN (n) || n < 0) return showToast ('Введите число N ≥ 0', 'error');
    renderMoreThanN (n);
  });

  const cardsBox = document.getElementById ('cards-container');

  cardsBox.addEventListener ('click', e => {
    const btn = e.target.closest ('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = parseInt (btn.dataset.id, 10);

    if (action === 'delete-travel') handleDeleteTravel (id);
    else if (action === 'remove-country')
      handleRemoveCountry (id, btn.dataset.country);
    else if (action === 'add-country-inline') handleAddCountryInline (id);
  });

  cardsBox.addEventListener ('keydown', e => {
    if (e.key !== 'Enter') return;
    const input = e.target.closest ('[data-inline-input]');
    if (!input) return;
    handleAddCountryInline (parseInt (input.dataset.inlineInput, 10));
  });
}

(function init () {
  travels = loadFromStorage ();

  // Демо-данные при первом запуске
  if (travels.length === 0) {
    travels = [
      new Travel (1, 'Алексей', ['Франция', 'Италия', 'Япония']),
      new Travel (2, 'Мария', ['Германия', 'Франция']),
      new Travel (3, 'Дмитрий', ['Испания']),
      new Travel (4, 'Елена', ['Япония', 'Китай', 'Корея', 'Таиланд']),
    ];
  }

  refresh ();
  renderFilterByCountry ('');
  renderMoreThanN (2);
  bindEvents ();
}) ();
