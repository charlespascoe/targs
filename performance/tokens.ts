import { tokeniseArguments } from '../lib/tokens';
import { describe, run } from './common';


function randomChar(): string {
  const charCode = Math.floor(Math.random() * 26);

  const lowercase = Math.random() >= 0.5;

  const chr = String.fromCharCode(65 + charCode);

  return lowercase ? chr.toLowerCase() : chr;
}


function randomChars(length: number): string {
  if (length <= 0) {
    return '';
  } else {
    return randomChar() + randomChars(length - 1);
  }
}


function randomArgs(length: number): string[] {

  const args: string[] = [];

  for (let i = 0; i < length; i++) {
    const rand = Math.random();

    if (rand < 0.25) {
      args.push(`-${randomChar()}`);
    } else if (rand < 0.5) {
      args.push(`-${randomChars(5)}`);
    } else if (rand < 0.75) {
      args.push(`--${randomChars(8)}`);
    } else {
      args.push(randomChars(20));
    }
  }

  return args;

}

describe('tokens', () => {

  describe('tokeniseArguments', () => {

    run(
      'Random arguments test (30 random arguments)',
      () => {
        const args = randomArgs(30);

        return () => {
          tokeniseArguments(args);
        };
      }
    );

  });

});

