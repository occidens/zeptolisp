import type { Expr, Atom } from "./parser.ts";
import { SymbolRegistry } from "./registry.ts";

function isAtom(expr: Expr) {
  return !Array.isArray(expr);
}


const registry = new SymbolRegistry();
const symbols = new Map();

const PLUS = registry.for("+");
const MINUS = registry.for("-");

symbols.set(PLUS, (a: number, b: number) => a + b);
symbols.set(MINUS, (a: number, b: number) => a - b);

function lookup(sym: symbol): (...args) => any {
    if (symbols.has(sym)) {
        return symbols.get(sym);
    }
    throw new Error("Unrecognized symbol");
}


function evaluate(expr: Expr) {
    if (isAtom(expr)) {
        return expr;
    }
  const [head, ...tail] = expr;

  // console.log('head %o', head)

  if (isAtom(head)) {
    if (typeof head === "number" || typeof head === "string") {
      if (tail.length > 0) {
        return new Error();
      }
      return head;
    }

    const fn = lookup(head);

    const acc = [];

    if (tail.length > 0) {
      for (const ex in tail) {
        acc.push(evaluate(ex));
      }
    }

    return fn(...acc);
  } else {
    throw new Error("Not implemented for now");
  }
}

export { registry, evaluate }

