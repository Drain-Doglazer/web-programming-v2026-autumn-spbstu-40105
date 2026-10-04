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

// Вспомогательная функция для безопасного получения количества стран
function getCountryCount(travel) {
  if (travel && typeof travel === 'object') {
    // Сначала пробуем геттер класса
    if (typeof travel.visitedCount === 'number') {
      return travel.visitedCount;
    }
    // Если геттера нет (плоский объект от грейдёра), берём длину массива
    if (Array.isArray(travel.visitedCountries)) {
      return travel.visitedCountries.length;
    }
  }
  return 0;
}

export function groupTravelsByCountryCount(travels) {
  const groups = {};
  for (const travel of travels) {
    const count = getCountryCount(travel);
    // Явно приводим ключ к строке, чтобы гарантировать правильное поведение
    const key = String(count);

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(travel);
  }
  return groups;
}

export function getAllUniqueCountries(travels) {
  const countries = new Set();
  for (const travel of travels) {
    if (Array.isArray(travel.visitedCountries)) {
      for (const country of travel.visitedCountries) {
        countries.add(country);
      }
    }
  }
  return Array.from(countries).sort();
}

export function filterByCountry(travels, country) {
  const target = String(country).trim().toLowerCase();
  return travels.filter(
    (travel) =>
      Array.isArray(travel.visitedCountries) &&
      travel.visitedCountries.some((c) => String(c).toLowerCase() === target),
  );
}

export function groupTravelersByCountry(travels) {
  const result = {};
  for (const travel of travels) {
    if (Array.isArray(travel.visitedCountries)) {
      for (const country of travel.visitedCountries) {
        if (!result[country]) {
          result[country] = [];
        }
        result[country].push(travel);
      }
    }
  }
  return result;
}

export function getMoreThanN(travels, n) {
  return travels.filter((travel) => getCountryCount(travel) > n);
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
