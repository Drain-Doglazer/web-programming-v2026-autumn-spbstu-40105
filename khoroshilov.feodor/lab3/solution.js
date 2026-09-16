'use strict';

export function moveZerosToEnd (arr) {
  let writeIndex = 0;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== 0) {
      arr[writeIndex] = arr[i];
      writeIndex++;
    }
  }

  for (let i = writeIndex; i < arr.length; i++) {
    arr[i] = 0;
  }

  return arr;
}
