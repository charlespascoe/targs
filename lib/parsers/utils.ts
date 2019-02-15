import { shortOptionNameRegex, longOptionNameRegex } from '../tokens';


export function validateNonposNames(shortName: string | null, longName: string | null): void {
  if (shortName === null && longName === null) {
    throw new Error('At least one of shortName or longName must be defined');
  }

  if (shortName !== null && !shortOptionNameRegex.test(shortName)) {
    throw new Error(`shortName '${shortName}' is invalid (must match ${shortOptionNameRegex})`);
  }

  if (longName !== null && !longOptionNameRegex.test(longName)) {
    throw new Error(`longName '${longName}' is invalid (must match ${longOptionNameRegex})`);
  }
}


const metavarRegex = /^[A-Z][A-Z_0-9\-]*$/;


export function validateMetavar(metavar: string): void {
  if (!metavarRegex.test(metavar)) {
    throw new Error(`metavar '${metavar}' is invalid (must match ${metavarRegex})`);
  }
}
