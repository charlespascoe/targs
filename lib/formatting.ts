export function formatOptions(shortName: string | null, longName: string | null): string {
  const bothDefined = shortName !== null && longName !== null;

  return (
    (shortName === null ? '' : `-${shortName}`) +
    (bothDefined ? '/' : '') +
    (longName === null ? '' : `--${longName}`)
  );
}

export function formatOptionsHint(shortName: string | null, longName: string | null): string {
  const bothDefined = shortName !== null && longName !== null;

  return (
    (shortName === null ? '  ' : `-${shortName}`) +
    (bothDefined ? ', ' : '  ') +
    (longName === null ? '' : `--${longName}`)
  );
}
