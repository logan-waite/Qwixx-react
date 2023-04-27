import { Color, DieValue } from "./types";

export function assertNever(x: never): never {
  throw new Error("Unexpected Object: " + x);
}

export function randomNumber(min: number, max: number) {
  // random number between min and max, inclusive
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomLetter() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[randomNumber(0, 25)];
}

export function createArray<T>(
  length = 0,
  fill: ((_: undefined) => T) | T | undefined = undefined
): Array<T> {
  if (fill instanceof Function) {
    return Array(length).fill(undefined).map(fill);
  } else {
    return Array(length).fill(fill);
  }
}

export function generateGuid() {
  return crypto.randomUUID();
}

export function saveToLocal(key: string, value: unknown) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.error(`Unable to save ${value} to local storage.`);
    console.error(e);
  }
}

export function getFromLocal<T>(key: string): T {
  let value;
  try {
    value = localStorage.getItem(key);
  } catch (e) {
    console.error("Unable to get value from local storage");
  }
  return value ? JSON.parse(value) : null;
}

export function randomDieNumber(): DieValue {
  return randomNumber(1, 6) as DieValue;
}

export function objectsAreEqual<T extends object>(a: T | null, b: T | null) {
  // currently a shallow comparison

  // check if both are null if one is
  if (a === null || b === null) {
    if (a !== b) {
      return false;
    }
  } else {
    const aKeys = Object.keys({});
    const bKeys = Object.keys({});

    // check same number of props
    if (aKeys.length !== bKeys.length) {
      return false;
    }

    // check has same props
    const aKeysSet = new Set(aKeys);
    for (const v of bKeys) {
      aKeysSet.add(v);
    }

    if (aKeysSet.size !== aKeys.length) {
      return false;
    }

    // check if values are the same
    for (const key in a) {
      if (a[key] !== b[key]) {
        return false;
      }
    }
  }

  return true;
}

export function max(...numbers: Array<number | null | undefined>): number {
  return numbers.reduce(
    (max: number, val: number | null | undefined) =>
      val != null && val > max ? val : max,
    -Infinity
  );
}

export function min(...numbers: Array<number | null | undefined>): number {
  return numbers.reduce(
    (min: number, val: number | null | undefined) =>
      val != null && val < min ? val : min,
    Infinity
  );
}

export function getValueByColor(color: Color) {
  return function getValue<T extends { color: Color; value: number }>(
    container: T | T[] | null
  ) {
    if (Array.isArray(container)) {
      const colorObj = container.find((v) => v.color === color);
      return colorObj?.value ?? null;
    } else if (container?.color && container.color === color) {
      return container.value;
    } else {
      return null;
    }
  };
}

export function sum(...args: number[]): number {
  return args.reduce((total, num) => total + num, 0);
}

export function pipe(...funcs: any[]) {
  return function _pipe(startingValue: any) {
    return funcs.reduce((endValue, func) => func(endValue), startingValue);
  };
}

export function map<T, U>(func: (arg: T) => U) {
  return function _map(list: T[]) {
    const result: U[] = [];
    for (const val of list) {
      result.push(func(val));
    }

    return result;
  };
}

export function sumPlus(...nums: number[]) {
  return function _sum(nums2: number | number[]) {
    if (Array.isArray(nums2)) {
      return sum(...nums, ...nums2);
    } else {
      return sum(...nums, nums2);
    }
  };
}
