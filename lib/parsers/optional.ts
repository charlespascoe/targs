import { shortOptionNameRegex, longOptionNameRegex } from '../tokens';
import { Argument } from './argument';


export interface IOptionalOptions {
  short?: string;
  long?: string;
  description?: string;
}


export abstract class Optional<T> extends Argument<T> {
  public readonly short: string | null = null;

  public readonly long: string | null = null;

  constructor(options: IOptionalOptions) {
    super(options.description || '');

    if (typeof options.short === 'string') {
      if (!shortOptionNameRegex.test(options.short)) {
        throw new Error(`Short flags and options must be a single character: '${options.short}' is not valid.`);
      }

      this.short = options.short;
    }

    if (typeof options.long === 'string') {
      if (!longOptionNameRegex.test(options.long)) {
        throw new Error(`Long flags and options must match ${longOptionNameRegex}: '${options.long}' does not match.`);
      }

      this.long = options.long;
    }

    if (this.short === null && this.long === null) {
      throw new Error('Either a short or long flag/option must be provided');
    }
  }

  protected getUsageExampleOption(): string {
    return `-${this.short ? '' : '-'}${this.short || this.long}`;
  }

  protected getShortLongOptions(): string {
    let result = '';

    if (this.short !== null) {
      result = `-${this.short}`;
    }

    if (this.long !== null) {
      if (result.length > 0) {
        result += '/';
      }

      result += `--${this.long}`;
    }

    return result;
  }
}
