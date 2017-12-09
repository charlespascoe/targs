export const shortOptionsRegex = /^-[a-z]+(=.*)?$/i;
export const longOptionRegex = /^--[a-z]+(-[a-z]+)*(=.*)?$/i;


export interface IShortOptionToken {
  type: 'short';
  value: string;
  argument: string | null;
}


export interface ILongOptionToken {
  type: 'long';
  value: string;
  argument: string | null;
}


export interface IArgumentToken {
  type: 'arg';
  argument: string;
}


export type Token = IShortOptionToken | ILongOptionToken | IArgumentToken;


export function tokeniseArguments(args: string[]): Token[] {
  const tokens: Token[] = [];

  let finishedFlags = false;

  for (const val of args) {
    if (finishedFlags || !val.startsWith('-')) {
      tokens.push({
        type: 'arg',
        argument: val
      });
      continue;
    }

    if (val === '--') {
      finishedFlags = true;
      continue;
    }

    if (shortOptionsRegex.test(val)) {
      let lastOptionArgument: string | null = null;
      let shortFlags: string;

      const equalsIndex = val.indexOf('=');

      if (equalsIndex >= 0) {
        lastOptionArgument = val.substr(equalsIndex + 1);
        shortFlags = val.substr(1, equalsIndex - 1);
      } else {
        shortFlags = val.substr(1);
      }

      let lastOption: IShortOptionToken | null = null;

      for (const shortOption of shortFlags.split('')) {
        lastOption = {
          type: 'short',
          value: shortOption,
          argument: null
        };

        tokens.push(lastOption);
      }

      if (lastOption !== null) {
        lastOption.argument = lastOptionArgument;
      }

      continue;
    }

    if (longOptionRegex.test(val)) {
      let argument: string | null = null;
      let longFlag: string;

      const equalsIndex = val.indexOf('=');

      if (equalsIndex >= 0) {
        argument = val.substr(equalsIndex + 1);
        longFlag = val.substr(2, equalsIndex - 2);
      } else {
        longFlag = val.substr(2);
      }

      tokens.push({
        type: 'long',
        value: longFlag,
        argument
      });

      continue;
    }

    throw new Error(`Unknown Flag/Option: ${val}`);
  }

  return tokens;
}
