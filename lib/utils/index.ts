import * as path from 'path';


export function without<T>(items: T[], withoutItems: T[]): T[] {
  const withoutItemsSet = new Set(withoutItems);

  return items.filter(item => !withoutItemsSet.has(item));
}


export function keysOf<T extends object>(arg: T): Array<keyof T> {
  const keys: Array<keyof T> = [];

  for (const sym of Object.getOwnPropertySymbols(arg)) {
    keys.push(sym as keyof T);
  }

  for (const key in arg) {
    keys.push(key);
  }

  return keys;
}


export function values<T extends {}>(obj: T): Array<T[keyof T]> {
  return keysOf(obj).map(key => obj[key]);
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


export function zipObjects<T extends {}, U extends {[K in keyof T]: any}, V>(a: T, b: U, func: (a: T[keyof T], b: U[keyof T]) => V): {[K in keyof T]: V} {
  const result: Partial<{[K in keyof T]: V}> = {};

  for (const key of keysOf(a)) {
    result[key] = func(a[key], b[key]);
  }

  return result as {[K in keyof T]: V};
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



export function takeWhile<T>(items: T[], predicate: (item: T) => boolean): T[];
export function takeWhile<T,U extends T>(items: T[], predicate: (item: T) => item is U): U[];
export function takeWhile<T>(items: T[], predicate: (item: T) => boolean): T[] {
  const indexOfFirstNonMatch = items.findIndex(item => !predicate(item));

  if (indexOfFirstNonMatch < 0) {
    return items;
  } else {
    return items.slice(0, indexOfFirstNonMatch);
  }
}


export function range(start: number, exclusiveEnd: number): number[] {
  const result: number[] = [];

  for (let i = start; i < exclusiveEnd; i++) {
    result.push(i);
  }

  return result;
}
