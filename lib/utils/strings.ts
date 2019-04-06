import { zip, padArray } from '../utils';


export function rightPad(str: string, length: number, padChar: string = ' '): string {
  if (padChar.length !== 1) throw new Error('padChar must be exactly one character long');
  return str + padChar.repeat(Math.max(length - str.length, 0));
}

export const formatEntry = (leftColumnWidth: number, separation: number, rightColumnWidth: number) => (leftColumn: string, rightColumn: string): string => {
  const leftLines = splitLines(leftColumn, leftColumnWidth);
  const rightLines = splitLines(rightColumn, rightColumnWidth);

  const totalLines = Math.max(leftLines.length, rightLines.length);

  return zip(
    padArray(leftLines, totalLines, '').map(line => rightPad(line, leftColumnWidth, ' ')),
    padArray(rightLines, totalLines, '').map(line => rightPad(line, rightColumnWidth, ' ')),
    (left, right) => left + ' '.repeat(separation) + right
  ).join('\n');
};


export function splitLines(text: string, maxWidth: number): string[] {
  const boundaryPattern = /(\s+)/;

  const components = text.split(boundaryPattern);

  let line = '';
  const lines: string[] = [];

  for (const component of components) {
    if (line.length + component.length > maxWidth) {
      lines.push(line);
      line = component.trim();
    } else {
      line += component;
    }
  }

  if (line !== '') {
    lines.push(line);
  }

  return lines;
}


export function highlightItem(items: string[], highlightIndex: number): string;
export function highlightItem(items: string[], highlightIndices: Set<number>): string;
export function highlightItem(items: string[], highlightIndices: number | Set<number>): string {
  const highlighItems: Set<number> = (
    typeof highlightIndices === 'number' ?
      new Set([highlightIndices])
    :
      highlightIndices
  );

  return (
    items.join(' ') + '\n' +
    items.map((item, index) => (highlighItems.has(index) ? '^' : ' ').repeat(item.length)).join(' ')
  );
}
