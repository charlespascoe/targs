import * as path from 'path';


export function without<T>(items: T[], withoutItems: T[]): T[] {
  const withoutItemsSet = new Set(withoutItems);

  return items.filter(item => !withoutItemsSet.has(item));
}


export function keysOf<T extends object>(arg: T): Array<keyof T> {
  const keys: Array<keyof T> = [];

  for (const key in arg) {
    keys.push(key);
  }

  return keys;
}


export function values<T extends {}>(obj: T): Array<T[keyof T]> {
  const values: Array<T[keyof T]> = [];

  for (const key in obj) {
    values.push(obj[key]);
  }

  return values;
}


export function entries<T extends {}, E>(obj: T, map: (key: keyof T, value: T[keyof T]) => E): E[] {
  return keysOf(obj).map(key => map(key, obj[key]));
}


export function zip<A,B,T>(a: A[], b: B[], zipFunc: (a: A, b: B) => T): T[] {
  const length = Math.min(a.length, b.length);

  const result: T[] = [];

  for (let i = 0; i < length; i++) {
    result.push(zipFunc(a[i], b[i]));
  }

  return result;
}


export function padArray<T>(arr: T[], length: number, padding: T): T[] {
  if (arr.length >= length) return arr;

  const suffix: T[] = [];

  for (let i = 0; i < length - arr.length; i++) {
    suffix.push(padding);
  }

  return arr.concat(suffix);
}


export const programName = path.basename((process.argv[1] || '').replace('.js', ''));

export const screenWidth = (() => {
  if (process.stdout.isTTY && process.stdout.columns !== undefined) {
    return process.stdout.columns;
  } else {
    return 100;
  }
})();

