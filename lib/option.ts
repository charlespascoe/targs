export type Option<T> = Some<T> | None;


export interface Some<T> {
  some: true;
  value: T;
}


export interface None {
  some: false;
}


export function some<T>(value: T): Some<T> {
  return {
    some: true,
    value
  };
}


export function none(): None {
  return {
    some: false
  };
}
