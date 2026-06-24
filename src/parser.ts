import type { Token } from "./tokenizer.ts";

type Atom = string | number | symbol;
type Expr = Atom | List;
type List = Array<Expr>;

function parse(tokens: Iterator<Token>): Expr {
  function next(): Token | null {
    const { done, value } = tokens.next();
    return done ? null : value;
  }

  const res = [];
  while (true) {
    const token = next();

    switch (token?.kind) {
      case "atom":
        res.push(token.value);
        break;
      case "delimiter":
        if (token.value === ")") {
          return res;
        } else if (token.value === "(") {
          res.push(parse(tokens));
        } else {
          throw new Error("Unexpected delimiter value");
        }
        break;
      case "error":
        throw new Error(token.value);
      default:
        throw new Error("Unexpected end of input");
    }
  }
}

export { parse };
export type { List, Atom, Expr };
