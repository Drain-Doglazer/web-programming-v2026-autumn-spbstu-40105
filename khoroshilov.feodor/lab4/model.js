export class Travel {
  constructor(id, travelerName, visitedCountries = []) {
    this.id = Number(id);
    this.travelerName = String(travelerName);
    this.visitedCountries = Array.isArray(visitedCountries)
      ? [...visitedCountries]
      : [];
  }

  addCountry(country) {
    const trimmed = String(country).trim();
    if (!trimmed) {
      throw new Error('Название страны не может быть пустым');
    }
    if (this.visitedCountries.includes(trimmed)) {
      throw new Error(`Страна "${trimmed}" уже добавлена`);
    }
    this.visitedCountries.push(trimmed);
  }

  removeCountry(country) {
    const trimmed = String(country).trim();
    const index = this.visitedCountries.indexOf(trimmed);
    if (index === -1) {
      throw new Error(`Страна "${trimmed}" не найдена`);
    }
    this.visitedCountries.splice(index, 1);
  }

  get visitedCount() {
    return this.visitedCountries.length;
  }
}

export function groupTravelsByCountryCount(travels) {
  const result = new Map();
  const items = Array.isArray(travels) ? travels : [travels];

  for (const item of items) {
    if (!item) {
      continue;
    }

    let count = 0;

    if (typeof item.visitedCount === 'number') {
      count = item.visitedCount;
    } else if (Array.isArray(item.visitedCountries)) {
      count = item.visitedCountries.length;
    } else if (typeof item.visitedCountries === 'string') {
      count = item.visitedCountries.trim() ? 1 : 0;
    } else if (typeof item.count === 'number') {
      count = item.count;
    }

    if (!result.has(count)) {
      result.set(count, []);
    }
    result.get(count).push(item);
  }

  return result;
}

export function getUniqueCountries(travels) {
  const countries = new Set();
  const items = Array.isArray(travels) ? travels : [travels];

  for (const item of items) {
    if (Array.isArray(item.visitedCountries)) {
      for (const c of item.visitedCountries) {
        countries.add(c);
      }
    } else if (
      typeof item.visitedCountries === 'string' &&
      item.visitedCountries.trim()
    ) {
      countries.add(item.visitedCountries);
    }
  }

  return Array.from(countries).sort();
}

export function findTravelsByCountry(travels, country) {
  const target = String(country).trim().toLowerCase();
  const items = Array.isArray(travels) ? travels : [travels];

  return items.filter((item) => {
    if (Array.isArray(item.visitedCountries)) {
      return item.visitedCountries.some(
        (c) => String(c).toLowerCase() === target,
      );
    } else if (typeof item.visitedCountries === 'string') {
      return item.visitedCountries.toLowerCase() === target;
    }
    return false;
  });
}

export function groupTravelersByCountry(travels) {
  const result = new Map();
  const items = Array.isArray(travels) ? travels : [travels];

  for (const item of items) {
    if (Array.isArray(item.visitedCountries)) {
      for (const country of item.visitedCountries) {
        if (!result.has(country)) {
          result.set(country, []);
        }
        result.get(country).push(item);
      }
    } else if (
      typeof item.visitedCountries === 'string' &&
      item.visitedCountries.trim()
    ) {
      const country = item.visitedCountries;
      if (!result.has(country)) {
        result.set(country, []);
      }
      result.get(country).push(item);
    }
  }

  return result;
}

export function findTravelsAboveCountryCount(travels, n) {
  const items = Array.isArray(travels) ? travels : [travels];

  return items.filter((item) => {
    let count = 0;

    if (typeof item.visitedCount === 'number') {
      count = item.visitedCount;
    } else if (Array.isArray(item.visitedCountries)) {
      count = item.visitedCountries.length;
    } else if (typeof item.visitedCountries === 'string') {
      count = item.visitedCountries.trim() ? 1 : 0;
    } else if (typeof item.count === 'number') {
      count = item.count;
    }

    return count > n;
  });
}

export function saveToStorage(travels) {
  localStorage.setItem('travels_data', JSON.stringify(travels));
}

export function loadFromStorage() {
  const raw = localStorage.getItem('travels_data');
  if (!raw) {
    return [];
  }
  try {
    const data = JSON.parse(raw);
    return data.map(
      (item) => new Travel(item.id, item.travelerName, item.visitedCountries),
    );
  } catch (error) {
    console.error('Ошибка загрузки из localStorage:', error);
    return [];
  }
}

export function asyncOperation(fn, delay = 100) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}
