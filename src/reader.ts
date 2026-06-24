import { tokenize } from "./tokenizer.ts";
import { parse, type Expr } from "./parser.ts";

function read(str: string, dump = false): Expr {
  const tokens = tokenize(str);
  if (dump) {
    console.log([...tokens]);
    return [];
  } else {
  return parse(tokens, true);
  }
}

export { read };
