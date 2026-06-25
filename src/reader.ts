import { tokenize } from "./tokenizer.ts";
import { parse, type Expr } from "./parser.ts";
import { SymbolRegistry } from "./registry.ts";

class Reader {
  #registry: SymbolRegistry;

  constructor(registry: SymbolRegistry = new SymbolRegistry()) {
    this.#registry = registry;
  }

  read(str: string): Expr {
    const tokens = tokenize(str);
    return parse(tokens, this.#registry, 0);
  }
}

export { Reader };
