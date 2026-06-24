import { exhaust } from "./exhaust.ts";
import type { Token } from "./tokenizer.ts";

type Atom = string | number | symbol;
type Expr = Atom | List;
type List = Array<Expr>;

function parse(tokens: Iterator<Token>, top: boolean = false): Expr {
  function next(): Token | null {
    const { done, value } = tokens.next();
    return done ? null : value;
  }

  const res = [];

  while (true) {
    const token = next();

    console.log("Token: %o", token);

    if (token === null) {
      break;
    }

    const { value, kind } = token;

    switch (kind) {
      case "string":
      case "number":
      case "symbol":
        res.push(value);
        break;

      case "delimiter":
        if (value === ")") {
          return res;
        } else if (value === "(") {
          res.push(parse(tokens));
        } else {
          throw new Error("Unexpected delimiter value");
        }
        break;

      case "error":
        throw new Error(value);
      default:
        exhaust(kind);
    }
  }
  if (top) {
    return res[0];
  }
  throw new Error("Unexpected end of input");
}

export { parse };
export type { List, Atom, Expr };
