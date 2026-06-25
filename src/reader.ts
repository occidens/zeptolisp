import { tokenize } from "./tokenizer.ts";
import { parse, type Expr } from "./parser.ts";
import { SymbolRegistry } from "./registry.ts";
import { registry } from "./evaluator.ts";

class Reader {
  #registry: SymbolRegistry;

  constructor(reg: SymbolRegistry = registry) {
    this.#registry = reg;
  }

  read(str: string): Expr {
    const tokens = tokenize(str);
    return parse(tokens, this.#registry, 0);
  }
}

export { Reader };
