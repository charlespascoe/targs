export * from './tokens';
export * from './parsers/parser'

import { parse } from './parsers/parser';
import { flag } from './parsers/flag';

console.log(parse([{type: 'short', value: 'f', argument: null, display: '-f'}], {flg: flag({shortName: 'F'})})); 
