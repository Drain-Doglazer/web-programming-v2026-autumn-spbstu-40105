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
  return travels.reduce((acc, travel) => {
    // Безопасное получение количества: геттер класса ИЛИ длина массива ИЛИ 0
    const count =
      typeof travel.visitedCount === 'number'
        ? travel.visitedCount
        : Array.isArray(travel.visitedCountries)
          ? travel.visitedCountries.length
          : 0;

    if (!acc[count]) {
      acc[count] = [];
    }
    acc[count].push(travel);
    return acc;
  }, {});
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
  return travels.filter((travel) => {
    const count =
      typeof travel.visitedCount === 'number'
        ? travel.visitedCount
        : Array.isArray(travel.visitedCountries)
          ? travel.visitedCountries.length
          : 0;
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
