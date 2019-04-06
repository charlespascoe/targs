export const shortOptionNameRegex = /^[a-z0-9]$/i;
export const longOptionNameRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/i;
export const shortOptionsRegex = /^-[a-z0-9]+$/i;
export const longOptionRegex = /^--[a-z0-9]+(-[a-z0-9]+)*$/i;


export interface ShortOptionToken {
  type: 'short';
  value: string;
}


export interface LongOptionToken {
  type: 'long';
  value: string;
}


export interface PositionalToken {
  type: 'positional';
  value: string;
}


export type Token = ShortOptionToken | LongOptionToken | PositionalToken;


export function formatToken(token: Token): string {
  switch (token.type) {
    case 'short':
      return `-${token.value}`;

    case 'long':
      return `--${token.value}`;

    case 'positional':
      return `'${token.value}'`;
  }
}


export interface TokenParseSuccess {
  success: true;
  tokens: Token[];
}

export interface TokenParseFailure {
  success: false;
  message: string;
  args: string[];
  index: number;
}


export function matchesToken(token: Token, shortName: string | null, longName: string | null): boolean {
  return (token.type === 'short' && token.value === shortName) || (token.type === 'long' && token.value === longName);
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
      const shortFlags = val.substr(1);

      for (const shortOption of shortFlags.split('')) {
        tokens.push({
          type: 'short',
          value: shortOption
        });
      }

      continue;
    }

    if (longOptionRegex.test(val)) {
      tokens.push({
        type: 'long',
        value: val.substr(2),
      });

      continue;
    }

    return {
      success: false,
      message: 'Unparsable token',
      args,
      index
    };
  }

  return {
    success: true,
    tokens
  };
}
