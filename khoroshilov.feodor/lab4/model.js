class Travel {
  /**
   * @param {number}   id               — уникальный номер
   * @param {string}   travelerName     — имя путешественника
   * @param {string[]} visitedCountries — массив стран
   */
  constructor (id, travelerName, visitedCountries = []) {
    this.id = id;
    this.travelerName = travelerName;
    this.visitedCountries = [...visitedCountries];
  }

  addCountry (country) {
    const trimmed = country.trim ();
    if (!trimmed) throw new Error ('Название страны не может быть пустым');
    if (this.visitedCountries.includes (trimmed)) {
      throw new Error (`Страна «${trimmed}» уже есть в списке`);
    }
    this.visitedCountries.push (trimmed);
  }

  removeCountry (country) {
    const trimmed = country.trim ();
    const idx = this.visitedCountries.indexOf (trimmed);
    if (idx === -1) throw new Error (`Страна «${trimmed}» не найдена`);
    this.visitedCountries.splice (idx, 1);
  }

  get visitedCount () {
    return this.visitedCountries.length;
  }

  toJSON () {
    return {
      id: this.id,
      travelerName: this.travelerName,
      visitedCountries: this.visitedCountries,
    };
  }

  static fromJSON (data) {
    return new Travel (data.id, data.travelerName, data.visitedCountries);
  }
}

function groupByVisitedCount (travels) {
  return travels.reduce ((acc, t) => {
    const key = t.visitedCount;
    if (!acc[key]) acc[key] = [];
    acc[key].push (t);
    return acc;
  }, {});
}

function getAllUniqueCountries (travels) {
  const set = new Set ();
  travels.forEach (t => t.visitedCountries.forEach (c => set.add (c)));
  return [...set].sort ();
}

/** Вернуть путешествия, включающие заданную страну */
function filterByCountry (travels, country) {
  const needle = country.trim ().toLowerCase ();
  return travels.filter (t =>
    t.visitedCountries.some (c => c.toLowerCase () === needle)
  );
}
function groupTravelersByCountry (travels) {
  const result = {};
  travels.forEach (t => {
    t.visitedCountries.forEach (c => {
      if (!result[c]) result[c] = [];
      result[c].push (t);
    });
  });
  return result;
}

function getMoreThanN (travels, n) {
  return travels.filter (t => t.visitedCount > n);
}

const STORAGE_KEY = 'travels_app_data';

function saveToStorage (travels) {
  const data = travels.map (t => t.toJSON ());
  localStorage.setItem (STORAGE_KEY, JSON.stringify (data));
}

function loadFromStorage () {
  try {
    const raw = localStorage.getItem (STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse (raw).map (item => Travel.fromJSON (item));
  } catch (e) {
    console.error ('Ошибка загрузки из localStorage:', e);
    return [];
  }
}

function asyncOperation (fn, delay = 400) {
  return new Promise ((resolve, reject) => {
    setTimeout (() => {
      try {
        resolve (fn ());
      } catch (err) {
        reject (err);
      }
    }, delay);
  });
}
