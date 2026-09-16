'use strict';

function getPluralForm (number, titles) {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20 ? 2 : cases[Math.min (number % 10, 5)]
  ];
}

export function timeAgo (date) {
  const now = new Date ();
  const past = new Date (date);
  const diffSec = Math.floor ((now - past) / 1000);

  if (diffSec < 0) {
    return 'в будущем';
  }
  if (diffSec < 5) {
    return 'только что';
  }

  const minutes = Math.floor (diffSec / 60);
  const hours = Math.floor (diffSec / 3600);
  const days = Math.floor (diffSec / 86400);
  const months = Math.floor (diffSec / 2592000);
  const years = Math.floor (diffSec / 31536000);

  if (minutes < 60) {
    return `${minutes} ${getPluralForm (minutes, [
      'минута',
      'минуты',
      'минут',
    ])} назад`;
  }
  if (hours < 24) {
    return `${hours} ${getPluralForm (hours, ['час', 'часа', 'часов'])} назад`;
  }
  if (days < 30) {
    return `${days} ${getPluralForm (days, ['день', 'дня', 'дней'])} назад`;
  }
  if (months < 12) {
    return `${months} ${getPluralForm (months, [
      'месяц',
      'месяца',
      'месяцев',
    ])} назад`;
  }

  return `${years} ${getPluralForm (years, ['год', 'года', 'лет'])} назад`;
}
