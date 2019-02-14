export * from './tokens';
export * from './parser'

import { tokeniseArguments } from './tokens';
import { parse } from './parser';
import { countFlag } from './parsers/count-flag';
import { optionalArgument } from './parsers/optional-argument';
import { flag } from './parsers/flag';
import { parser } from './subcommands';
import { Handler } from './handler';
import { NonPositionalArgumentParserGroup } from './parsers/argument-parser';
import { success } from './result';


const p = parser({
  count: countFlag({
    shortName: 'x',
    longName: 'ex',
    description: 'Count the number of times "x" occurs in the arguments list'
  }),
  test: flag({
    longName: 'test',
    description: 'Activates test mode'
  }),
  argument: optionalArgument({
    longName: 'foobar',
    metavar: 'ARG',
    description: 'The argument ARG is for foobar',
    suggestCompletion: (partialArg) => ['Hello, world', 'Hi there', 'Foo Bar Baz'].filter(arg => arg.startsWith(partialArg)),
    defaultValue: ':)'
  })
});

const foo = p.subcommand(
  'foo', 'Foo mode',
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
).action((args) => {
  console.log(args);
});

p.execute(process.argv.slice(2));

//const tokens = tokeniseArguments(process.argv.slice(2, process.argv.length - 1));
//
//if (tokens.success) {
//  console.log(p.suggestCompletion(tokens.tokens, process.argv[process.argv.length - 1]));
//}

