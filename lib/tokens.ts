export const shortOptionNameRegex = /^[a-z0-9]$/i;
export const longOptionNameRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/i;
export const shortOptionsRegex = /^-[a-z0-9]+(=.*)?$/i;
export const longOptionRegex = /^--[a-z0-9]+(-[a-z0-9]+)*(=.*)?$/i;


export interface ShortOptionToken {
  type: 'short';
  value: string;
  argument: string | null;
}


export interface LongOptionToken {
  type: 'long';
  value: string;
  argument: string | null;
}


export interface PositionalToken {
  type: 'positional';
  value: string;
}


export type Token = ShortOptionToken | LongOptionToken | PositionalToken;


interface TokenParseSuccess {
  success: true;
  tokens: Token[];
}

interface TokenParseFailure {
  success: false;
  message: string;
  args: string[];
  index: number;
}


export function tokeniseArguments(args: string[]): TokenParseSuccess | TokenParseFailure {
  const tokens: Token[] = [];

  let finishedFlags = false;

  for (let index = 0; index < args.length; index++) {
    const val = args[index];

    if (finishedFlags || !val.startsWith('-')) {
      tokens.push({
        type: 'positional',
        value: val
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

      let lastOption: ShortOptionToken | null = null;

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
      const equalsIndex = val.indexOf('=');

      if (equalsIndex >= 0) {
        tokens.push({
          type: 'long',
          value: val.substr(2, equalsIndex - 2),
          argument: val.substr(equalsIndex + 1)
        });
      } else {
        tokens.push({
          type: 'long',
          value: val.substr(2),
          argument: null
        });
      }

      continue;
    }

    return {
      success: false,
      message: 'Unknown token',
      args,
      index
    };
  }

  return {
    success: true,
    tokens
  };
}
