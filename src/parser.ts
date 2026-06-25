import { exhaust } from "./exhaust.ts";
import type { Token } from "./tokenizer.ts";
import type { SymbolRegistry } from "./registry.ts";

type Atom = string | number | symbol;
type Expr = Atom | List;
type List = Array<Expr>;

function parse(tokens: Iterator<Token>, registry: SymbolRegistry, depth: number = 0): Expr {
  function next(): Token | null {
    const { done, value } = tokens.next();
    return done ? null : value;
  }

  const acc = [];

  while (true) {
    const token = next();

    // console.log("Token: %o", token);
    // console.log("Depth %d", depth);

    if (token === null) {
      break;
    }

    const { value, kind } = token;

    switch (kind) {
      case "string":
      case "number":
        acc.push(value);
        break;

      case "symbol":
        acc.push(registry.for(value));
        break;

      case "delimiter":
        if (value === ")") {
          return acc;
        } else if (value === "(") {
          acc.push(parse(tokens, registry, depth + 1));
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
  if (depth === 0) {
    return acc;
  }
  throw new Error("Unexpected end of input");
}

export { parse };
export type { List, Atom, Expr };
