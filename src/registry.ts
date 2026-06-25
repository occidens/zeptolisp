class SymbolRegistry {
  #byKey = new Map<string, symbol>();
  #bySym = new Map<symbol, string>();

  for(key: string): symbol {
    if (this.#byKey.has(key)) {
      return this.#byKey.get(key)!;
    }

    const sym = Symbol(key);

    this.#byKey.set(key, sym);
    this.#bySym.set(sym, key);

    return sym;
  }

  keyFor(sym: symbol): string | undefined {
    return this.#bySym.get(sym);
  }
}

export { SymbolRegistry };
