import { tokenize } from "./tokenizer.ts";
import { parse, type Expr } from "./parser.ts";

function read(str: string): Expr {
  const tokens = tokenize(str);
  return parse(tokens);
}

export { read };
