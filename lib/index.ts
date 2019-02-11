export * from './tokens';
export * from './parser'

import { tokeniseArguments } from './tokens';
import { parse } from './parser';
import { countFlag } from './parsers/count-flag';
import { flag } from './parsers/flag';
import { parser } from './subcommands';
import { Handler } from './handler';
import { NonPositionalArgumentParserGroup } from './parsers/argument-parser';


const p = parser({
  count: countFlag({
    shortName: 'x',
    longName: 'ex',
    description: 'Count the number of times "x" occurs in the arguments list'
  }),
  test: flag({
    longName: 'test',
    description: 'Activates test mode'
  })
});

const foo = p.subcommand(
  'foo',
  'Foo mode',
  {
    foo: flag({
      longName: 'foo',
      description: 'Turns on Uber-Foo mode'
    })
  }
).action((args) => console.log(args));

const bar = p.subcommand(
  'bar',
  'Bar mode',
  {
    bar: flag({
      longName: 'bar',
      description: 'Turns on Uber-Bar mode'
    })
  }
).action((args) => console.log(args));


p.execute(process.argv.slice(2));
