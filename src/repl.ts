import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { read } from "./reader.ts"
import { tokenize } from "./tokenizer.ts";

const rl = createInterface({ input, output });

while (true) {
  const line = await rl.question('repl:> ');
  if (/^\s*(\s*quit\s*)\s*$/.test(line)) {
    break;
  };
  console.log([...tokenize(line)]);
  // const expr = read(line);
  //console.log(expr);
}

rl.close();