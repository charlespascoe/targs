import { Result } from '../result';


export interface DefaultValue<D> {
  defaultValue: D;
}


export interface ReadArgument<T> {
  readArgument: (arg: string) => Result<T>;
}
