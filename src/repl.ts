import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { Reader } from "./reader.ts";
import { print } from "./print.ts";
import { SymbolRegistry } from "./registry.ts";

const histfile = join(import.meta.dirname, ".repl_history");

function loadHistory() {
  try {
    const history = readFileSync(histfile, "utf8");
    return history.split("\n");
  } catch {
    console.warn("Failed to load history");
    return [];
  }
}

function dumpHistory(history: Array<string>) {
  try {
    writeFileSync(histfile, history.join("\n"));
  } catch {
    console.warn("Failed to save history");
  }
}

const history = loadHistory();

const repl = createInterface({ input, output, history });

repl.on("history", dumpHistory);

const symbols = new SymbolRegistry();
const reader = new Reader(symbols);

repl.setPrompt("repl:> ");
repl.prompt();

for await (const line of repl) {
  try {
      const expr = reader.read(line);
      print(expr);
  } catch (err) {
    console.error(new Error("REPL Error", { cause: err }))
  }
  repl.prompt();
}

process.stdout.write("\n");
