'use strict';

import readline from 'node:readline';

const rl = readline.createInterface ({
  input: process.stdin,
  output: process.stdout,
});

function getPluralForm (number, titles) {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20 ? 2 : cases[Math.min (number % 10, 5)]
  ];
}

function getTimeAgo (pastDate, nowDate) {
  let diffSec = Math.floor ((nowDate - pastDate) / 1000);

  if (diffSec < 0) return 'дата в будущем';
  if (diffSec < 5) return 'только что';

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

function isValidDate (dateString) {
  const date = new Date (dateString);
  return !isNaN (date.getTime ());
}

function askDate (question) {
  return new Promise (resolve => {
    rl.question (question, answer => {
      const trimmed = answer.trim ();

      if (trimmed.toLowerCase () === 'now' || trimmed === '') {
        resolve (new Date ());
        return;
      }

      if (!isValidDate (trimmed)) {
        console.log ('Некорректная дата. Попробуйте снова.\n');
        resolve (askDate (question));
        return;
      }

      resolve (new Date (trimmed));
    });
  });
}

async function main () {
  console.log ("=== Калькулятор 'Сколько времени прошло' ===\n");
  console.log ('Форматы даты:');
  console.log ('  - 2024-01-15');
  console.log ('  - 2024-01-15T14:30:00');
  console.log ('  - January 15, 2024');
  console.log ("  - 'now' или Enter — текущее время\n");

  const date1 = await askDate ('Введите первую дату (от которой считаем): ');
  console.log (` Принято: ${date1.toLocaleString ('ru-RU')}\n`);

  const date2 = await askDate (
    "Введите вторую дату (до которой считаем) или 'now': "
  );
  console.log (` Принято: ${date2.toLocaleString ('ru-RU')}\n`);

  let past, now;
  if (date1 < date2) {
    past = date1;
    now = date2;
  } else {
    past = date2;
    now = date1;
  }

  const result = getTimeAgo (past, now);
  console.log ('='.repeat (50));
  console.log (`Результат: ${result}`);
  console.log ('='.repeat (50));

  rl.close ();
}

main ();
