export type Result<T> = SuccessResult<T> | ErrorResult;


export interface SuccessResult<T> {
  success: true;
  value: T;
}


export interface ErrorResult {
  success: false;
  message: string;
}


export function success<T>(value: T): SuccessResult<T> {
  return {
    success: true,
    value
  };
}

export function error(message: string): ErrorResult {
  return {
    success: false,
    message
  };
}

export function mapResults<T,U>(items: T[], mapFunc: (item: T) => Result<U>): Result<U[]> {
  const array: U[] = [];

  for (const item of items) {
    const result = mapFunc(item);

    if (!result.success) {
      return result;
    } else {
      array.push(result.value);
    }
  }

  return success(array);
}
