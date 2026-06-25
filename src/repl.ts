import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { Reader } from "./reader.ts";
import { print } from "./print.ts";
import { SymbolRegistry } from "./registry.ts";
import { evaluate } from "./evaluator.ts";

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

const reader = new Reader();
repl.setPrompt("repl:> ");
repl.prompt();

for await (const line of repl) {
  try {
    const forms = reader.read(line);
    for (const form of forms) {
      const res = evaluate(form);
      console.log(res);
    }
    //print(res);
  } catch (err) {
    console.error(new Error("REPL Error", { cause: err }));
  }
  repl.prompt();
}

process.stdout.write("\n");
